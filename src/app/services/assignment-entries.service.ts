import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {HttpService, nonAtomicParams} from './http.service'
import {applyFilter} from './http.filter'
import {makePath} from '../utils/component.utils'
import {AssignmentEntry, AssignmentEntryProtocol} from '../models/assignment-plan.model'

interface AssignmentEntryFilter {
    attribute: 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class AssignmentEntriesService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = (course: string) => makePath('assignmentEntries', course)

    getAllWithFilter = (
        courseId: string,
        ...filter: AssignmentEntryFilter[]
    ): Observable<AssignmentEntry[]> => this.http.getAll(this.path(courseId), applyFilter(filter, nonAtomicParams))

    update = (
        courseId: string,
        id: string,
        body: AssignmentEntryProtocol
    ): Observable<AssignmentEntry> => this.http.put(this.path(courseId), id, body)

    create = (
        courseId: string,
        body: AssignmentEntryProtocol
    ): Observable<AssignmentEntry> => this.http.create(this.path(courseId), body)

    delete = (
        courseId: string,
        id: string
    ): Observable<AssignmentEntry> => this.http.delete(this.path(courseId), id)

    takeover = (
        courseId: string,
        srcLabworkId: string,
        destLabworkId: string
    ): Observable<AssignmentEntry[]> => {
        const body = {srcLabwork: srcLabworkId, destLabwork: destLabworkId}
        return this.http.put_(`${this.path(courseId)}/takeover`, body)
    }
}
