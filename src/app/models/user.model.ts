export class User {

  static urlResource = 'users';

  constructor(public systemId: string, public lastname: string, public firstname: string, public email: string, public status: string, public id?: string) { }

}
