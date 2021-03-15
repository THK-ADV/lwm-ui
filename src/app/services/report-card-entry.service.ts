import {applyFilter} from './http.filter'
import {Injectable} from '@angular/core'
import {atomicParams, HttpService, nonAtomicParams} from './http.service'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ReportCardEntryAtom, ReportCardEntryAtomJSON, ReportCardEntryJSON} from '../models/report-card-entry.model'
import {makePath} from '../utils/component.utils'
import {_groupBy} from '../utils/functions'
import {
    convertManyReportCardEntries,
    convertManyReportCardEntriesAtom,
    convertManyReportCardRescheduledAtomJSON,
    mapReportCardEntryAtomJSON
} from '../utils/http-utils'
import {ReportCardEntry} from './lwm.service'
import {Time} from '../models/time.model'
import {Room} from '../models/room.model'
import {ReportCardRescheduledAtom, ReportCardRescheduledAtomJSON} from '../models/report-card-rescheduled.model'

interface ReportCardEntryFilter {
    attribute: 'course' | 'student' | 'labwork' | 'scheduleEntry' | 'semester'
    value: string
}

export interface RescheduleCandidate {
    date: Date
    start: Time
    end: Time
    room: Room
    members: number
}

interface RescheduleCandidateJson {
    date: string
    start: string
    end: string
    room: Room,
    members: number
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

    fromScheduleEntry = (courseId: string, scheduleEntryId: string): Observable<[ReportCardEntryAtom, number, ReportCardRescheduledAtom[]][]> => this.http
        .getAll<[ReportCardEntryAtomJSON, number, ReportCardRescheduledAtomJSON[]]>(
            `${makePath(this.path, courseId)}/scheduleEntry/${scheduleEntryId}`,
            atomicParams
        )
        .pipe(map(x => x.map(([e, n, rs]) =>
            [mapReportCardEntryAtomJSON(e), n, convertManyReportCardRescheduledAtomJSON(rs)]
        )))

    fromStudent = (student: string, labwork: string) => this.http
        .getAll<ReportCardEntryAtomJSON>(`${this.path}/student/${student}?labwork=${labwork}`)
        .pipe(map(convertManyReportCardEntriesAtom))

    rescheduleCandidates = (courseId: string, semesterId: string): Observable<RescheduleCandidate[]> =>
        this.http
            .getAll<RescheduleCandidateJson>(`courses/${courseId}/rescheduleCandidates/semesters/${semesterId}`)
            .pipe(map(xs => xs.map(this.fromJson)))

    download = (courseId: string, labworkId: string): Observable<Blob> =>
        this.http.downloadXlsSheet(makePath(this.path, courseId, labworkId) + '/sheet')

    private fromJson = (x: RescheduleCandidateJson): RescheduleCandidate => {
        const date = new Date(x.date)

        return {
            ...x,
            date: date,
            start: Time.fromTimeString(x.start, date),
            end: Time.fromTimeString(x.end, date)
        }
    }
}
