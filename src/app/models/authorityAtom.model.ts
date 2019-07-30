import {User} from './user.model'
import {Role} from './role.model'
import {CourseAtom} from './courseAtom.model'

export class    AuthorityAtom {

    static urlResource = 'authorities'
    static contentType = 'application/vnd.fhk.authority.V1+json'

    constructor(public user: User, public role: Role, public course?: CourseAtom, public id?: String) {
    }

}
