import { User } from './user.model';

export class AuthorityAtom {

    static urlResource = 'authorities';
    static contentType = 'application/vnd.fhk.authority.V1+json';
  
    constructor(public user: User, public role: String, public course?: String, public id?: String) { }
  
  }