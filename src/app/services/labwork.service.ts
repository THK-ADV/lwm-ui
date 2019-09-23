import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {HttpParams} from '@angular/common/http'
import {Labwork, LabworkAtom, LabworkProtocol} from '../models/labwork.model'
import {makePath} from '../utils/component.utils'

@Injectable({
    providedIn: 'root'
})
export class LabworkService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'labworks'

    get = (courseId: string, id: string): Observable<LabworkAtom> => this.http
        .get(makePath(this.path, courseId), id, atomicParams)

    getAll = (courseId: string, semester?: string): Observable<LabworkAtom[]> => this.http
        .getAll(makePath(this.path, courseId), this.withSemester(semester))

    delete = (courseId: string, id: string): Observable<Labwork> => this.http
        .delete(makePath(this.path, courseId), id)

    update = (courseId: string, labwork: LabworkProtocol, id: string): Observable<LabworkAtom> => this.http
        .put(makePath(this.path, courseId), id, labwork, atomicParams)

    create = (courseId: string, labwork: LabworkProtocol): Observable<LabworkAtom> => this.http
        .create(makePath(this.path, courseId), labwork, atomicParams)

    private withSemester = (semester?: string): HttpParams | undefined => {
        return semester ? new HttpParams().set('semester', semester) : undefined
    }
}
