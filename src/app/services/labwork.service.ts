import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {Observable} from 'rxjs'
import {HttpParams} from '@angular/common/http'
import {Semester} from '../models/semester.model'
import {CourseAtom} from '../models/course.model'
import {Degree} from '../models/degree.model'

export interface LabworkAtom {
    label: string
    description: string
    semester: Semester
    course: CourseAtom
    degree: Degree
    subscribable: boolean
    published: boolean
    id: string
}

interface LabworkProtocol {
    label: string
    description: string
    semester: string
    course: string
    degree: string
    subscribable: boolean
    published: boolean
}

@Injectable({
    providedIn: 'root'
})
export class LabworkService {

    constructor(private http: HttpService) {
    }

    getAll(courseId: string, semester?: string): Observable<LabworkAtom[]> {
        const params = this.withSemester(semester)
        return this.http.getAll(this.makePath(courseId), params)
    }

    private makePath = (courseId: string): string => `courses/${courseId}/labworks`

    private withSemester = (semester?: string): HttpParams | undefined => {
        return semester ? new HttpParams().set('semester', semester) : undefined
    }
}
