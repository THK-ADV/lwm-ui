import {Injectable} from '@angular/core'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {map} from 'rxjs/operators'
import {Semester, SemesterProtocol} from '../models/semester.model'

interface SemesterJSON { // this intermediate type is needed to convert from string to Date
    label: string
    abbreviation: string
    start: string
    end: string
    examStart: string
    id: string
}

@Injectable({
    providedIn: 'root'
})
export class SemesterService implements AbstractCRUDService<SemesterProtocol, Semester> {

    constructor(private http: HttpService) {
    }

    private path = 'semesters'

    createMany(protocol: SemesterProtocol): Observable<Semester[]> {
        return this.http.createMany<SemesterProtocol, SemesterJSON>(this.path, [protocol])
            .pipe(map(this.convertMany))
    }

    delete(id: string): Observable<Semester> {
        return this.http.delete(this.path, id)
    }

    getAll(): Observable<Semester[]> {
        return this.http.get<SemesterJSON[]>(this.path)
            .pipe(map(this.convertMany))
    }

    update(protocol: SemesterProtocol, id: string): Observable<Semester> {
        return this.http.put<SemesterProtocol, SemesterJSON>(this.path, id, protocol)
            .pipe(map(this.convert))
    }

    convertMany = (semesters: SemesterJSON[]): Semester[] => semesters.map(this.convert)

    convert = (s: SemesterJSON): Semester => (
        {
            label: s.label,
            abbreviation: s.abbreviation,
            start: new Date(s.start),
            end: new Date(s.end),
            examStart: new Date(s.examStart),
            id: s.id
        }
    )
}
