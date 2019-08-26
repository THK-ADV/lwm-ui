import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {LabworkApplication} from '../models/labwork.application.model'
import {Time} from '../models/time.model'
import {Observable} from 'rxjs'

interface GroupMembership {
    group: string
    student: string
    id: string
}

interface ReportCardEntryType {
    entryType: string
    bool?: boolean
    int: number
    id: string
}

interface ReportCardEntry {
    student: string
    labwork: string
    label: string
    date: Date
    start: Time
    end: Time
    room: string
    entryTypes: ReportCardEntryType[]
    id: string
}

export interface GroupInsertionResult {
    labworkApplication: LabworkApplication
    membership: GroupMembership
    reportCards: ReportCardEntry[]
}

@Injectable({
    providedIn: 'root'
})
export class LwmService {

    constructor(private readonly http: HttpService) {
    }

    insertStudentIntoGroup(courseId: string, labworkId: string, destGroupId: string, studentId: string): Observable<GroupInsertionResult> {
        return this.http.put_(`courses/${courseId}/labworks/${labworkId}/groups/${destGroupId}/insert/${studentId}`)
    }
}
