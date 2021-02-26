import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {LabworkApplication} from '../models/labwork.application.model'
import {Time} from '../models/time.model'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {EntryType} from '../models/assignment-plan.model'
import {ReportCardEvaluationAtom} from '../models/report-card-evaluation'
import {GroupAtom} from '../models/group.model'

interface GroupMembership {
    group: string
    student: string
    id: string
}

interface ReportCardEntryType {
    entryType: EntryType
    bool?: boolean
    int: number
    id: string
}

export interface ReportCardEntry {
    student: string
    labwork: string
    label: string
    date: Date
    start: Time
    end: Time
    room: string
    entryTypes: ReportCardEntryType[]
    assignmentIndex: number
    rescheduled?: string
    retry?: string
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

export type ExplicitEvaluationKind = 'fastForward' | 'fire'

export interface ExplicitEvaluationRequest {
    labwork: string
    student: string
    group: string
    kind: ExplicitEvaluationKind
}

export interface ExplicitEvaluationResult {
    evals: ReportCardEvaluationAtom
    group: GroupAtom
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

    evaluateExplicit = (
        courseId: string,
        request: ExplicitEvaluationRequest
    ): Observable<ExplicitEvaluationResult> => this.http
        .put_(makePath('evaluateExplicit', courseId), request)
}
