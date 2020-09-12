import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';
import _default from '@feathersjs/authentication/lib/hooks/authenticate';
import { Id } from '@feathersjs/feathers';


export interface PlayerData {
  _id?: Id,
  name: string;
  life?: number;
  score?: number;
}

export interface PlayerInitializer {
  _id?: Id;
  name?: string;
}

export class Players extends Service {
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
  }
}
