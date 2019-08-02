import {Injectable} from '@angular/core'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {map} from 'rxjs/operators'

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

    create(protocol: SemesterProtocol): Observable<Semester[]> {
        return this.http.create(this.path, [protocol])
    }

    delete(id: string): Observable<Semester> {
        return this.http.delete(this.path, id)
    }

    getAll(): Observable<Semester[]> {
        return this.http.get<SemesterJSON[]>(this.path)
            .pipe(map(this.convert))
    }

    update(protocol: SemesterProtocol, id: string): Observable<Semester> {
        return this.http.put(this.path, id, protocol)
    }

    private convert(semesters: SemesterJSON[]): Semester[] {
        return semesters.map(s => {
            return {
                label: s.label,
                abbreviation: s.abbreviation,
                start: new Date(s.start),
                end: new Date(s.end),
                examStart: new Date(s.examStart),
                id: s.id
            }
        })
    }
}
