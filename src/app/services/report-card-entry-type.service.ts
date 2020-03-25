import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {ReportCardEntryType} from '../models/report-card-entry.model'

export interface ReportCardEntryTypeProtocol {
    entryType: string
    bool?: boolean
    int: number
}

@Injectable({
    providedIn: 'root'
})
export class ReportCardEntryTypeService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = 'reportCardEntryTypes'

    update = (courseId: string, id: string, body: ReportCardEntryTypeProtocol): Observable<ReportCardEntryType> =>
        this.http.put(makePath(this.path, courseId), id, body)
}
