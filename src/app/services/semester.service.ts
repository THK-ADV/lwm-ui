import {Injectable} from '@angular/core'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {map, take} from 'rxjs/operators'
import {Semester, SemesterJSON, SemesterProtocol} from '../models/semester.model'
import {HttpParams} from '@angular/common/http'
import {convertManySemesters, mapSemesterJSON} from '../utils/http-utils'

@Injectable({
    providedIn: 'root'
})
export class SemesterService implements AbstractCRUDService<SemesterProtocol, Semester> {

    constructor(private http: HttpService) {
    }

    private path = 'semesters'

    current = (): Observable<Semester> => {
        return this.getAll0(new HttpParams().set('select', 'current'))
            .pipe(take(1), map(s => s[0]))
    }

    createMany = (protocol: SemesterProtocol): Observable<Semester[]> => {
        return this.http.createMany<SemesterProtocol, SemesterJSON>(this.path, [protocol])
            .pipe(map(convertManySemesters))
    }

    delete = (id: string): Observable<Semester> => {
        return this.http.delete(this.path, id)
    }

    getAll = (): Observable<Semester[]> => this.getAll0()

    update = (protocol: SemesterProtocol, id: string): Observable<Semester> => {
        return this.http.put<SemesterProtocol, SemesterJSON>(this.path, id, protocol)
            .pipe(map(mapSemesterJSON))
    }

    private getAll0 = (params?: HttpParams): Observable<Semester[]> => {
        return this.http.getAll<SemesterJSON[]>(this.path, params)
            .pipe(map(convertManySemesters))
    }
}
