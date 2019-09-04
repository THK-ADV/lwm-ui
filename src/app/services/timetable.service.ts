import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {applyFilter} from './http.filter'
import {TimetableAtom, TimetableAtomJSON, TimetableProtocol} from '../models/timetable'
import {map} from 'rxjs/operators'
import {convertManyTimetables, mapTimetableAtomJSON} from '../utils/http-utils'

interface TimetablePlanFilter {
    attribute: 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class TimetableService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = 'timetables'

    getAllWithFilter(courseId: string, ...filter: TimetablePlanFilter[]): Observable<TimetableAtom[]> {
        return this.http.getAll<TimetableAtomJSON[]>(makePath(this.path, courseId), applyFilter(filter, atomicParams)).pipe(
            map(convertManyTimetables)
        )
    }

    update(courseId: string, id: string, body: TimetableProtocol): Observable<TimetableAtom> {
        return this.http.put<TimetableProtocol, TimetableAtomJSON>(makePath(this.path, courseId), id, body, atomicParams).pipe(
            map(mapTimetableAtomJSON)
        )
    }
}
