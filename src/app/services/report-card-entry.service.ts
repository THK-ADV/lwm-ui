import {applyFilter} from './http.filter'
import {Injectable} from '@angular/core'
import {HttpService, nonAtomicParams} from './http.service'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ReportCardEntryAtom, ReportCardEntryAtomJSON, ReportCardEntryJSON} from '../models/report-card-entry.model'
import {makePath} from '../utils/component.utils'
import {_groupBy} from '../utils/functions'
import {convertManyReportCardEntries, convertManyReportCardEntriesAtom} from '../utils/http-utils'
import {ReportCardEntry} from './lwm.service'

interface ReportCardEntryFilter {
    attribute: 'course' | 'student' | 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class ReportCardEntryService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = 'reportCardEntries'

    count = (courseId: string, labworkId: string): Observable<number> => this.http
        .get_(makePath(`${this.path}/count`, courseId, labworkId))

    delete = (
        courseId: string,
        labworkId: string
    ): Observable<unknown> => this.http
        .delete_(makePath(this.path, courseId, labworkId))

    create = (
        courseId: string,
        labworkId: string
    ): Observable<number> => this.http
        .create<{}, ReportCardEntryJSON[]>(makePath(this.path, courseId, labworkId), {})
        .pipe(map(xs => Object.keys(_groupBy(xs, e => e.student)).length))

    getAllWithFilter = (courseId: string, ...filter: ReportCardEntryFilter[]): Observable<ReportCardEntryAtom[]> => this.http
        .getAll<ReportCardEntryAtomJSON>(makePath(this.path, courseId), applyFilter(filter))
        .pipe(map(convertManyReportCardEntriesAtom))

    getAllWithFilterNonAtomic = (courseId: string, ...filter: ReportCardEntryFilter[]): Observable<ReportCardEntry[]> => this.http
        .getAll<ReportCardEntryJSON>(makePath(this.path, courseId), applyFilter(filter, nonAtomicParams))
        .pipe(map(convertManyReportCardEntries))

    fromScheduleEntry = (courseId: string, scheduleEntryId: string): Observable<ReportCardEntryAtom[]> => this.http
        .getAll<ReportCardEntryAtomJSON>(`${makePath('scheduleEntries', courseId)}/${scheduleEntryId}/reportCardEntries`)
        .pipe(map(convertManyReportCardEntriesAtom))

    fromStudent = (student: string, labwork: string) => this.http
        .getAll<ReportCardEntryAtomJSON>(`${this.path}/student/${student}?labwork=${labwork}`)
        .pipe(map(convertManyReportCardEntriesAtom))
}
