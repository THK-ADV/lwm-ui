import {Injectable} from '@angular/core'
import {atomicParams, HttpService, nonAtomicParams} from './http.service'
import {Observable} from 'rxjs'
import {Annotation, AnnotationAtom} from '../models/annotation'
import {makePath} from '../utils/component.utils'
import {applyFilter, ParamFilter} from './http.filter'
import {map} from 'rxjs/operators'
import {ReportCardEntry} from './lwm.service'
import {User} from '../models/user.model'

interface AnnotationProtocol {
    reportCardEntry: string
    author: string
    message: string
}

interface AnnotationFilter extends ParamFilter {
    attribute: 'labwork' | 'course' | 'student' | 'author' | 'reportCardEntry'
    value: string
}

interface AnnotationJSON {
    reportCardEntry: string
    author: string
    message: string
    lastModified: string
    id: string
}

export interface AnnotationAtomJSON {
    reportCardEntry: ReportCardEntry
    author: User
    message: string
    lastModified: string
    id: string
}


@Injectable({
    providedIn: 'root'
})
export class AnnotationService {

    private readonly resource = 'annotations'

    constructor(private readonly http: HttpService) {
    }

    create = (courseId: string, protocol: AnnotationProtocol): Observable<Annotation> =>
        this.http
            .create(makePath(this.resource, courseId), protocol, nonAtomicParams)
            .pipe(map(this.fromJson))

    update = (courseId: string, protocol: AnnotationProtocol, id: string): Observable<Annotation> =>
        this.http
            .put(makePath(this.resource, courseId), id, protocol, atomicParams)
            .pipe(map(this.fromJson))

    delete = (courseId: string, id: string): Observable<Annotation> =>
        this.http
            .delete(makePath(this.resource, courseId), id)
            .pipe(map(this.fromJson))

    getAll = (courseId: string, ...filter: AnnotationFilter[]): Observable<AnnotationAtom[]> =>
        this.http
            .getAll(makePath(this.resource, courseId), applyFilter(filter, atomicParams))
            .pipe(map(_ => _.map(this.fromAtomicJson)))

    fromReportCardEntry = (courseId: string, reportCardEntry: string): Observable<AnnotationAtom[]> =>
        this.getAll(courseId, {attribute: 'reportCardEntry', value: reportCardEntry})

    private fromAtomicJson = (x: AnnotationAtomJSON): AnnotationAtom => ({
        ...x,
        lastModified: new Date(x.lastModified),
    })

    private fromJson = (x: AnnotationJSON): Annotation => ({
        ...x,
        lastModified: new Date(x.lastModified),
    })
}
