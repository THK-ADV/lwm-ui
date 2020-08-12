import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {LabworkApplication} from '../models/labwork.application.model'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {ReportCardEntry} from '../models/report-card-entry.model'

interface GroupMembership {
    group: string
    student: string
    id: string
}

export interface GroupInsertionResult {
    labworkApplication: LabworkApplication
    membership: GroupMembership
    reportCardEntries: ReportCardEntry[]
}

export interface GroupDeletionResult {
    labworkApplication: LabworkApplication
    changedMembership: boolean
    reportCardEntries: ReportCardEntry[]
}

export interface GroupMovementResult {
    newMembership: GroupMembership
    changedMembership: boolean
    updatedReportCardEntries: ReportCardEntry[]
}

export interface GroupChangeRequest {
    labwork: string
    student: string
    group: string
}

export interface GroupMovingRequest {
    labwork: string
    student: string
    srcGroup: string
    destGroup: string
}

@Injectable({
    providedIn: 'root'
})
export class LwmService {

    constructor(private readonly http: HttpService) {
    }

    insertStudentIntoGroup = (
        courseId: string,
        request: GroupChangeRequest
    ): Observable<GroupInsertionResult> => this.http
        .put_(makePath('insertIntoGroup', courseId), request)

    removeStudentFromGroup = (
        courseId: string,
        request: GroupChangeRequest
    ): Observable<GroupDeletionResult> => this.http
        .put_(makePath('removeFromGroup', courseId), request)

    moveStudentToGroup = (
        courseId: string,
        request: GroupMovingRequest
    ): Observable<GroupMovementResult> => this.http
        .put_(makePath('moveToGroup', courseId), request)
}
