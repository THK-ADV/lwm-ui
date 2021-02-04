import {Injectable} from '@angular/core'
import {AuthorityAtom, AuthorityProtocol} from '../models/authority.model'
import {Observable} from 'rxjs'
import {atomicParams, HttpService} from './http.service'
import {applyFilter} from './http.filter'
import {makePath} from '../utils/component.utils'

interface Filter {
    attribute: 'systemId' | 'course'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class AuthorityService {

    private readonly path = 'authorities'

    constructor(private http: HttpService) {
    }

    private systemIdFilter = (systemId: string): Filter =>
        ({attribute: 'systemId', value: systemId})

    private courseFilter = (course: string): Filter =>
        ({attribute: 'course', value: course})

    getAuthorities = (systemId: string): Observable<AuthorityAtom[]> =>
        this.http.getAll(this.path, applyFilter([this.systemIdFilter(systemId)], atomicParams))

    getAuthoritiesForCourse = (courseId: string): Observable<AuthorityAtom[]> =>
        this.http.getAll(this.path, applyFilter([this.courseFilter(courseId)], atomicParams))

    getAll = (): Observable<AuthorityAtom[]> =>
        this.http.getAll(this.path)

    create = (courseId: string, protocol: AuthorityProtocol): Observable<AuthorityAtom> =>
        this.http.create(makePath(this.path, courseId), protocol, atomicParams)

    delete = (courseId: string, id: string): Observable<AuthorityAtom> =>
        this.http.delete(makePath(this.path, courseId), id)
}
