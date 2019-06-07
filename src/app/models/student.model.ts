import {User} from './user.model';
import {Degree} from './degree.model';

export class Student extends User {

  static STATUS_KEY = 'student';

  constructor(systemId: string, lastname: string, firstname: string, email: string, status: string, public registrationId: string,
              public enrollment: Degree, public id?: string) {

    super(systemId, lastname, firstname, email, status, id);

  }


}
