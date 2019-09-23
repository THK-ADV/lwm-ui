import {Injectable} from '@angular/core'
import {HttpParams} from '@angular/common/http'
import {AuthorityAtom, AuthorityProtocol} from '../models/authority.model'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {NotImplementedError} from '../utils/functions'

@Injectable({
    providedIn: 'root'
})
export class AuthorityService implements AbstractCRUDService<AuthorityProtocol, AuthorityAtom> {

    private readonly path = 'authorities'

    constructor(private http: HttpService) {
    }

    getAuthorities = (systemId: string): Observable<AuthorityAtom[]> => {
        const params = new HttpParams().set('systemId', systemId)
        return this.http.getAll(this.path, params)
    }

    getAuthoritiesForCourse = (courseId: string): Observable<AuthorityAtom[]> => {
        const params = new HttpParams().set('course', courseId)
        return this.http.getAll(this.path, params)
    }

    create = (protocol: AuthorityProtocol): Observable<AuthorityAtom> => {
        const params = new HttpParams().set('atomic', 'true')
        return this.http.create(this.path, [protocol], params)
    }

    getAll = (): Observable<AuthorityAtom[]> => this.http.getAll(this.path)

    delete = (id: string): Observable<AuthorityAtom> => this.http.delete(this.path, id)

    update = (protocol: AuthorityProtocol, id: string): Observable<AuthorityAtom> => NotImplementedError()
}
