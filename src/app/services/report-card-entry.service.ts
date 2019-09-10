import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {ReportCardEntryAtomJSON} from '../models/report-card-entry.model'
import {makePath} from '../utils/component.utils'
import {applyFilter} from './http.filter'
import {_groupBy} from '../utils/functions'

@Injectable({
    providedIn: 'root'
})
export class ReportCardEntryService {

    constructor(private readonly http: HttpService) {
    }

    // TODO better introduce reportCardEntryCount

    private readonly path = 'reportCardEntries'

    count = (courseId: string, labworkId: string): Observable<number> => {
        const labworkFilter = {attribute: 'labwork', value: labworkId}
        return this.http.getAll<ReportCardEntryAtomJSON[]>(
            makePath(this.path, courseId),
            applyFilter([labworkFilter], atomicParams)
        ).pipe(
            map(xs => Object.keys(_groupBy(xs, e => e.student.id)).length)
        )
    }
}
