import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Role} from '../models/role.model'
import {Observable} from 'rxjs'
import {exists, NotImplementedError} from '../utils/functions'
import {map} from 'rxjs/operators'
import {AllUserStatus} from '../models/userStatus.model'

@Injectable({
    providedIn: 'root'
})
export class RoleService implements AbstractCRUDService<Role, Role> {

    constructor(private http: HttpService) {
    }

    private readonly path = 'roles'

    create(protocol: Role): Observable<Role[]> {
        return NotImplementedError()
    }

    delete(id: string): Observable<Role> {
        return NotImplementedError()
    }

    getAll(): Observable<Role[]> {
        return this.http.get(this.path)
    }

    update(protocol: Role, id: string): Observable<Role> {
        return NotImplementedError()
    }

    getCourseRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.path)
            .pipe(
                map(roles => {
                    const userRoles = AllUserStatus()
                    return roles.filter(r => !exists(userRoles, u => r.label === u) && r.label !== 'Rechteverantwortlicher') // TODO move to backend
                })
            )
    }
}