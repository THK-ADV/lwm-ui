import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {convertManyScheduleEntries} from '../utils/http-utils'
import {ScheduleEntryAtom, ScheduleEntryAtomJSON} from '../models/schedule-entry.model'
import {makePath} from '../utils/component.utils'

interface ScheduleEntryFilter {
    attribute: 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class ScheduleEntryService {

    constructor(private readonly http: HttpService) {
    }

    private path = 'scheduleEntries'

    getAllWithFilter = (courseId: string, labworkId: string): Observable<ScheduleEntryAtom[]> => {
        return this.http.getAll<ScheduleEntryAtomJSON[]>(makePath(this.path, courseId, labworkId), atomicParams).pipe(
            map(convertManyScheduleEntries)
        )
    }
}
