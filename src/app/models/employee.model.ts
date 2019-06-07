import {User} from './user.model';

export class Employee extends User{

  static STATUS_KEY = 'employee';

  constructor(systemId: string, lastname: string, firstname: string, email: string, status: string, public id?: string) {
    super(systemId, lastname, firstname, email, status, id);
  }


}
