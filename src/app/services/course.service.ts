import {Injectable} from '@angular/core'
import {HttpService, nonAtomicParams} from './http.service'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {CourseAtom} from '../models/course'
import {Observable} from 'rxjs'
import {NotImplementedError} from '../utils/functions'

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

    create(protocol: CourseProtocol): Observable<CourseAtom[]> {
        return NotImplementedError()
    }

    delete(id: string): Observable<CourseAtom> {
        return NotImplementedError()
    }

    getAll(): Observable<CourseAtom[]> {
        return this.http.get(this.path)
    }

    update(protocol: CourseProtocol, id: string): Observable<CourseAtom> {
        return NotImplementedError()
    }
}
