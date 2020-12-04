import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {mapReportCardRescheduledAtomJSON} from '../utils/http-utils'
import {
    ReportCardRescheduledAtom,
    ReportCardRescheduledAtomJSON,
    ReportCardRescheduledProtocol
} from '../models/report-card-rescheduled.model'
import {makePath} from '../utils/component.utils'

@Injectable({
    providedIn: 'root'
})
export class RescheduleService {

    private readonly path = 'reportCardReschedules'

    constructor(private readonly http: HttpService) {
    }

    create = (courseId: string, protocol: ReportCardRescheduledProtocol): Observable<ReportCardRescheduledAtom> =>
        this.http
            .create<ReportCardRescheduledProtocol, ReportCardRescheduledAtomJSON>(makePath(this.path, courseId), protocol, atomicParams)
            .pipe(map(mapReportCardRescheduledAtomJSON))
}
