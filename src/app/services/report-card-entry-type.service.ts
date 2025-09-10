import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {ReportCardEntryType} from '../models/report-card-entry.model'
import {EntryType} from '../models/assignment-plan.model'

export interface ReportCardEntryTypeProtocol {
    entryType: string
    bool?: boolean
    int: number
}

interface BatchUpdateProtocol {
    users: string[]
    assignmentEntry: string
    entryType: EntryType
    bool?: boolean
    int?: number
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

    updateMany = (
        courseId: string,
        labworkId: string,
        users: string[],
        assignmentEntry: string,
        entryType: EntryType,
        value: boolean | number,
    ): Observable<number> => {
        const body: BatchUpdateProtocol = {
            users: users,
            assignmentEntry: assignmentEntry,
            entryType: entryType,
            int: typeof value === "number" ? value : undefined,
            bool: typeof value === "boolean" ? value : undefined,
        }
        return this.http.put_(makePath(this.path, courseId, labworkId), body)
    }
}
