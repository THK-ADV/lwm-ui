import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {CourseAtom} from '../models/course.model'
import {Observable} from 'rxjs'
import {NotImplementedError} from '../utils/functions'
import {map} from 'rxjs/operators'

export interface CourseProtocol {
    label: string
    description: string
    abbreviation: string
    lecturer: string
    semesterIndex: number
}

@Injectable({
    providedIn: 'root'
})
export class CourseService implements AbstractCRUDService<CourseProtocol, CourseAtom> {

    constructor(private http: HttpService) {
    }

    private path = 'courses'

    get(id: string): Observable<CourseAtom> {
        return this.http.get(this.path, id)
    }

    createMany(protocol: CourseProtocol): Observable<CourseAtom[]> {
        return this.http.create<CourseProtocol, CourseAtom>(this.path, protocol, atomicParams)
            .pipe(map(course => [course]))
    }

    delete(id: string): Observable<CourseAtom> {
        return NotImplementedError()
    }

    getAll(): Observable<CourseAtom[]> {
        return this.http.getAll(this.path)
    }

    update(protocol: CourseProtocol, id: string): Observable<CourseAtom> {
        return this.http.put(this.path, id, protocol, atomicParams)
    }
}
