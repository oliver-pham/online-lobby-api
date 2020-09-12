import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '../../declarations';


interface UserData {
	_id?: string;
	email: string;
	password: string;
}

export class Users extends Service<UserData> {
	constructor(options: Partial<MongooseServiceOptions>, app: Application) {
		super(options);
	}
}
