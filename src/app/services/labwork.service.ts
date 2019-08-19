import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {HttpParams} from '@angular/common/http'
import {Labwork, LabworkAtom, LabworkProtocol} from '../models/labwork.model'

@Injectable({
    providedIn: 'root'
})
export class LabworkService {

    constructor(private http: HttpService) {
    }

    get(courseId: string, id: string): Observable<LabworkAtom> {
        return this.http.get(this.makePath(courseId), id, atomicParams)
    }

    getAll(courseId: string, semester?: string): Observable<LabworkAtom[]> {
        const params = this.withSemester(semester)
        return this.http.getAll(this.makePath(courseId), params)
    }

    delete(courseId: string, id: string): Observable<Labwork> {
        return this.http.delete(this.makePath(courseId), id)
    }

    update(courseId: string, labwork: LabworkProtocol, id: string): Observable<LabworkAtom> {
        return this.http.put(this.makePath(courseId), id, labwork, atomicParams)
    }

    create(courseId: string, labwork: LabworkProtocol): Observable<LabworkAtom[]> {
        return this.http.createMany(this.makePath(courseId), [labwork], atomicParams)
    }

    private makePath = (courseId: string): string => `courses/${courseId}/labworks`

    private withSemester = (semester?: string): HttpParams | undefined => {
        return semester ? new HttpParams().set('semester', semester) : undefined
    }
}
