import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {HttpParams} from '@angular/common/http'
import {Labwork, LabworkAtom, LabworkAtomJSON, LabworkProtocol} from '../models/labwork.model'
import {makePath} from '../utils/component.utils'
import {map} from 'rxjs/operators'
import {convertManyLabworks, mapLabworkJSON} from '../utils/http-utils'

@Injectable({
    providedIn: 'root'
})
export class LabworkService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'labworks'

    get = (courseId: string, id: string): Observable<LabworkAtom> => this.http
        .get<LabworkAtomJSON>(makePath(this.path, courseId), id, atomicParams)
        .pipe(map(mapLabworkJSON))

    getAll = (courseId: string, semester?: string): Observable<LabworkAtom[]> => this.http
        .getAll<LabworkAtomJSON>(makePath(this.path, courseId), this.withSemester(semester))
        .pipe(map(convertManyLabworks))

    delete = (courseId: string, id: string): Observable<Labwork> => this.http
        .delete(makePath(this.path, courseId), id)

    update = (courseId: string, labwork: LabworkProtocol, id: string): Observable<LabworkAtom> => this.http
        .put<LabworkProtocol, LabworkAtomJSON>(makePath(this.path, courseId), id, labwork, atomicParams)
        .pipe(map(mapLabworkJSON))

    create = (courseId: string, labwork: LabworkProtocol): Observable<LabworkAtom> => this.http
        .create<LabworkProtocol, LabworkAtomJSON>(makePath(this.path, courseId), labwork, atomicParams)
        .pipe(map(mapLabworkJSON))

    private withSemester = (semester?: string): HttpParams | undefined => {
        return semester ? new HttpParams().set('semester', semester) : undefined
    }
}
