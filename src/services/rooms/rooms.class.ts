import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';
import { Params, Id, Paginated } from '@feathersjs/feathers';
import { PlayerData, PlayerInitializer } from '../players/players.class';


export interface RoomInit {
  number: string;
  player: PlayerData;
}

export interface RoomUpdate {
  number?: string;
  players: Id[];
}

export interface RoomPatch {
  number?: string;
  player?: PlayerInitializer;
}

export interface Room {
  _id: object;
  number: string;
  players: Id[];
}

function isPaginated(res: any[] | Paginated<any>): res is Paginated<any> {
  return (res as Paginated<any>).data !== undefined;
}

export class Rooms extends Service {
  app: Application;

  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async removePlayerFromRoom(id: Id, room: Room) {
    // Be careful when using 'indexOf' with 'splice' (unwanted side effect)
    let found = false;
    for (let i = 0; !found && i < room.players.length; i++) {
      if (room.players[i].toString() == id.toString()) {
        found = true;
        await this.app.service('players').remove(id);
        room.players.splice(i, 1);
      }
    }
    if (room.players.length <= 0) {
      await this.remove(room._id.toString());
    }
  }

  async addPlayerToRoom(data: object, room: Room) {
    const player: PlayerData = await this.app.service('players').create(data);
    if (player._id)
      room.players.push(player._id);
  }

  async find(params?: Params): Promise<any> {
    const res = await super.find(params);

    if (isPaginated(res))
      return res.data[0];
    else
      return res[0];
  }

  async create(data: RoomInit, params?: Params) {
    const { number } = data;
    // Create a player
    const player: PlayerData = await this.app.service('players').create(data.player, params);
    // Create a room with that player
    const roomData = {
      number,
      players: [ player._id ]
    };
    if (params?.connection) {
      this.app.channel(`room/${number}`).join(params.connection);
    }

    return super.create(roomData, params);
  }

  async patch(id: Id, data: RoomPatch, params?: Params) {
    let room: Room = await super.get(id);
    if (data.player) {
      const playerLeftRoom = data.player._id;
      if (playerLeftRoom) {
        await this.removePlayerFromRoom(playerLeftRoom, room);
      }
      else {
        await this.addPlayerToRoom(data.player, room);
      }
    }

    if (data.number && typeof data.number === "string") {
      room.number = data.number;
    }

    if (params?.connection) {
      this.app.channel(`room/${room.number}`).join(params.connection);
    }

    console.log(room);
    return super.patch(id, room, params);
  }

  async update(id: Id, data: RoomUpdate, params?: Params) {
    const playersAreValid = data.players.every(player => {
      return typeof player === 'object';
    });
    const valid = data.number && playersAreValid;

    if (valid)
      return super.update(id, data, params);
    else
      throw new Error('Invalid update');
  }

  async remove(id: Id, params?: Params) {
    const room: Room = await super.get(id, params);
    for (let i = 0; i < room.players.length; i++) {
      await this.app.service('players').remove(room.players[i]);
    }
    if (params?.connection) {
      this.app.channel(`room/${room.number}`).leave(params.connection);
    }

    return super.remove(id, params);
  }
}
