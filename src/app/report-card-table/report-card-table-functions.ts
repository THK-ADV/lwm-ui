import {ReportCardEntryAtom, ReportCardEntryType} from '../models/report-card-entry.model'
import {exists, foldUndefined, mapUndefined} from '../utils/functions'
import {AssignmentEntryTypeValue, stringToAssignmentEntryTypeValue} from '../models/assignment-plan.model'
import {ReportCardEntryTypeService} from '../services/report-card-entry-type.service'
import {Observable} from 'rxjs'

export interface Ternary {
    kind: 'ternary'
    value: TernaryState
}

export interface Numbered {
    kind: 'numbered'
    value: number
}

export type ReportCardEntryTypeValue = Numbered | Ternary

export enum TernaryState {
    passed = 1,
    failed = 0,
    neutral = -1
}

export const liftedTernaryState = (v: number): TernaryState | undefined => {
    switch (v) {
        case -1:
            return TernaryState.neutral
        case 0:
            return TernaryState.failed
        case 1:
            return TernaryState.passed
        default:
            return undefined
    }
}

export const hasReportCardEntryTypeValue = (e: ReportCardEntryAtom, type: string): boolean =>
    exists(e.entryTypes, _ => _.entryType === type)

export const reportCardEntryTypeValue = (e: ReportCardEntryAtom, type: string): ReportCardEntryTypeValue | undefined => {
    const liftedType = stringToAssignmentEntryTypeValue(type)

    if (!liftedType) {
        return undefined
    }

    const entryType = e.entryTypes.find(_ => _.entryType === liftedType)

    if (!entryType) {
        return undefined
    }

    switch (liftedType) {
        case AssignmentEntryTypeValue.attendance:
        case AssignmentEntryTypeValue.certificate:
        case AssignmentEntryTypeValue.supplement:
            return {
                kind: 'ternary',
                value: foldUndefined(entryType.bool, b => b ? TernaryState.passed : TernaryState.failed, () => TernaryState.neutral)
            }
        case AssignmentEntryTypeValue.bonus:
            return {
                kind: 'numbered',
                value: entryType.int
            }
    }
}

export const reportCardEntryType = (e: ReportCardEntryAtom, type: string): ReportCardEntryType | undefined =>
    mapUndefined(stringToAssignmentEntryTypeValue(type), t => e.entryTypes.find(_ => _.entryType === t))

export const updateReportCardEntryType = (
    service: ReportCardEntryTypeService,
    course: string,
    entry: ReportCardEntryType
): Observable<ReportCardEntryType> =>
    service.update(course, entry.id, entry)

