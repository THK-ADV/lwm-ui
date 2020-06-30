import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {ReportCardEvaluationAtom, ReportCardEvaluationAtomJSON} from '../models/report-card-evaluation'
import {makePath} from '../utils/component.utils'
import {map, tap} from 'rxjs/operators'
import {convertManyReportCardEvaluations} from '../utils/http-utils'

@Injectable({
    providedIn: 'root'
})
export class ReportCardEvaluationService {

    constructor(
        private readonly http: HttpService
    ) {
    }

    private path = 'reportCardEvaluations'

    create = (courseId: string, labworkId: string): Observable<ReportCardEvaluationAtom[]> =>
        this.http.create<Object, ReportCardEvaluationAtomJSON[]>(makePath(this.path, courseId, labworkId), {}, atomicParams)
            .pipe(tap(xs => console.log(xs)), map(convertManyReportCardEvaluations))

    getAll = (courseId: string, labworkId: string): Observable<ReportCardEvaluationAtom[]> =>
        this.http.getAll<ReportCardEvaluationAtomJSON>(makePath(this.path, courseId, labworkId), atomicParams)
            .pipe(map(convertManyReportCardEvaluations))

    download = (courseId: string, labworkId: string): Observable<Blob> =>
        this.http.download(makePath(this.path, courseId, labworkId) + '/sheet')
            .pipe(map(data => new Blob([data], {type: 'application/vnd.ms-excel'})))

    // delete = (id: string, courseId: string): Observable<ReportCardEvaluationPattern> =>
    //     this.http.delete(makePath(this.path, courseId), id)
    //

    //
    // update = (pattern: ReportCardEvaluationPatternProtocol, id: string, courseId: string): Observable<ReportCardEvaluationPattern> =>
    //     this.http.put(makePath(this.path, courseId), id, pattern)
}
