import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {ReportCardRescheduledAtom} from '../models/report-card-rescheduled'
import {makePath} from '../utils/component.utils'
import {map} from 'rxjs/operators'
import {mapReportCardRescheduledAtomJSON} from '../utils/http-utils'

export interface ReportCardRescheduledProtocol {
    date: string
    start: string
    end: string
    room: string
    reason?: string
}

@Injectable({
    providedIn: 'root'
})
export class RescheduleService {

    constructor(private readonly http: HttpService) {
    }

    private resourceName = 'reportCardReschedules'

    create = (protocol: ReportCardRescheduledProtocol, courseId: string): Observable<ReportCardRescheduledAtom> => this.http
        .create(makePath(this.resourceName, courseId), protocol, atomicParams)
        .pipe(map(mapReportCardRescheduledAtomJSON))
}
