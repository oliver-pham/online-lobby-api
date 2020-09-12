import assert from 'assert';
import { Id, Paginated } from '@feathersjs/feathers';
import app from '../../src/app';
import shortid from 'shortid';
import {
  RoomInit,
  Room,
  RoomPatch
} from '../../src/services/rooms/rooms.class';
import { PlayerTestSuite } from './players.test';


const mongooseClient = app.get('mongooseClient');

async function generatePlayers() {
  let players: Id[] = [];
  for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
    const player = await PlayerTestSuite.createOnePlayer();
    players.push(player._id);
  }

  return players;
}

function generateRoomNumber(): number {
  return Math.floor(Math.random() * 1000000);
}

function isPaginated(res: any[] | Paginated<any>): res is Paginated<any> {
  return (res as Paginated<any>).data !== undefined;
}

export const RoomTestSuite = {
  setSampleId: function (id: object) {
    this.sampleId = id.toString();
  },
  getSampleId: function (): string {
    return this.sampleId;
  },
  createOneRoom: async function () {
    const number: string = generateRoomNumber().toString();
    const room: RoomInit = {
      number,
      player: {
        name: shortid.generate()
      }
    };
    
    return await app.service('rooms').create(room);
  },
  findOneRoom: function (number: string): Room | void {
    app.service('rooms').find({
      query: {
        number
      }
    })
    .then(res => {
      if (isPaginated(res)) {
        return res.data[0];
      }
      else {
        return res[0];
      }
    })
    .catch(err => {
      console.error(err)
    });
  },
  getOneRoom: async function (id: Id, query?: object) {
    const params = {
      query
    };

    return await app.service('rooms').get(id, params);
  },
  updateOneRoom: async function (id: Id, players: Id[]) {
    const room: Room = {
      _id: mongooseClient.Types.ObjectId(id),
      number: generateRoomNumber().toString(),
      players
    };

    return await app.service('rooms').update(id, room);
  },
  joinRoom: async function (roomId: Id) {
    const patch: RoomPatch = {
      player: {
        name: shortid.generate()
      }
    };

    return await app.service('rooms').patch(roomId, patch);
  },
  leaveRoom: async function (roomId: Id, playerId: Id) {
    const patch: RoomPatch = {
      player: {
        _id: playerId
      }
    };

    return await app.service('rooms').patch(roomId, patch);
  },
  removeOneRoom: async function (id: Id) {
    try {
      await app.service('rooms').remove(id);
    } catch (err) {
      console.error(err);
    }
  }
};

const Assertor = {
  validateRoom: async function (room: Room) {
    describe('initializes all properties', () => {
      it('valid _id', () => {
        assert.equal(typeof room._id, "object");
      });

      it('valid room number', () => {
        assert.equal(typeof room.number, "string");
      });

      it('valid players', () => {
        assert.equal(typeof room.players, "object");
        assert.ok(room.players.length >= 0);
      });
    });
  },
  compare2Rooms: async function (r1: Room, r2: Room, props: string[]) {
    describe('compares two rooms', () => {
      for (let i = 0; i < props.length; i++) {
        it('same ' + props[i], () => {
          if (typeof r1[props[i]] === "object") {
            assert.strictEqual(JSON.stringify(r1[props[i]]), JSON.stringify(r2[props[i]]));
          }
          else {
            assert.strictEqual(r1[props[i]], r2[props[i]]);
          }
        });
      }
    });
  },
  contrast2Rooms: async function (r1: Room, r2: Room, props: string[]) {
    describe('contrasts two rooms', () => {
      for (let i = 0; i < props.length; i++) {
        it('different ' + props[i], () => {
          if (typeof r1[props[i]] === "object") {
            assert.notStrictEqual(JSON.stringify(r1[props[i]]), JSON.stringify(r2[props[i]]));
          }
          else {
            assert.notStrictEqual(r1[props[i]], r2[props[i]]);
          }
        });
      }
    });
  },
  hasMorePlayers: function (firstRoom: Room, secondRoom: Room) {
    describe('compare number of players', () => {
      it('first room > second room', () => {
        assert.ok(firstRoom.players.length > secondRoom.players.length);
      });
    });
  }
};

describe('\'rooms\' service', () => {
  it('registered the service', () => {
    const service = app.service('rooms');

    assert.ok(service, 'Registered the service');
  });

  before(async () => {
    const room: Room = await RoomTestSuite.createOneRoom();
    RoomTestSuite.setSampleId(room._id);
  });

  describe('test create method', () => {
    it('creates a room', async () => {
      const room: Room = await RoomTestSuite.createOneRoom();

      Assertor.validateRoom(room);
  
      await RoomTestSuite.removeOneRoom(room._id.toString());
    });  
  });

  describe('test update method', () => {
    var newPlayers: Id[];
    before(async () => {
      newPlayers = await generatePlayers();
    });

    it('updates room players', async () => {
      const id = RoomTestSuite.getSampleId();
      const changedProps = ['number', 'players'];
      const room: Room = await RoomTestSuite.getOneRoom(id);
      const players = room.players.concat(newPlayers);
      const res: Room = await RoomTestSuite.updateOneRoom(id, players);

      Assertor.validateRoom(res);
      Assertor.contrast2Rooms(res, room, changedProps);
    });
  });

  describe('test patch method', () => {
    it('join room', async () => {
      const id = RoomTestSuite.getSampleId();
      const room: Room = await RoomTestSuite.getOneRoom(id);
      const changedProps = ['players'];
      const res: Room = await RoomTestSuite.joinRoom(id);

      Assertor.validateRoom(res);
      Assertor.contrast2Rooms(res, room, changedProps);
      Assertor.hasMorePlayers(res, room);
    });

    it('leave room', async () => {
      const id = RoomTestSuite.getSampleId();
      const room: Room = await RoomTestSuite.getOneRoom(id);
      const playerId = room.players[room.players.length - 1];
      const changedProps = ['players'];
      const res: Room = await RoomTestSuite.leaveRoom(id, playerId);

      Assertor.validateRoom(res);
      Assertor.contrast2Rooms(res, room, changedProps);
      Assertor.hasMorePlayers(room, res);
    });
  });

  after(async () => {
    return await RoomTestSuite.removeOneRoom(RoomTestSuite.getSampleId());
  });
});