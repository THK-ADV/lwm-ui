import {Injectable} from '@angular/core'
import {HttpParams} from '@angular/common/http'
import {AuthorityAtom, AuthorityProtocol} from '../models/authority.model'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {UserStatus} from '../models/userStatus.model'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {NotImplementedError} from '../utils/functions'

@Injectable({
    providedIn: 'root'
})
export class AuthorityService implements AbstractCRUDService<AuthorityProtocol, AuthorityAtom> {

    private readonly path = 'authorities'

    constructor(private http: HttpService) {
    }

    getAuthorities(systemId: string): Observable<AuthorityAtom[]> {
        const params = new HttpParams().set('systemId', systemId)
        return this.http.get(this.path, params)
    }

    hasStatus(status: UserStatus, authorities: AuthorityAtom[]): boolean {
        return authorities.some(auth => auth.role.label === status)
    }

    is(status: UserStatus, auth: AuthorityAtom): boolean {
        return auth.role.label === status
    }

    isAdmin(authorities: AuthorityAtom[]): boolean {
        return this.hasStatus(UserStatus.admin, authorities)
    }

    createMany(protocol: AuthorityProtocol): Observable<AuthorityAtom[]> {
        const params = new HttpParams().set('atomic', 'true')
        return this.http.createMany(this.path, [protocol], params)
    }

    getAll(): Observable<AuthorityAtom[]> {
        return this.http.get(this.path)
    }

    delete(id: string): Observable<AuthorityAtom> {
        return this.http.delete(this.path, id)
    }

    update(protocol: AuthorityProtocol, id: string): Observable<AuthorityAtom> {
        return NotImplementedError()
    }
}
