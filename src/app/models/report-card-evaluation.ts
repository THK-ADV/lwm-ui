import {EntryType} from './assignment-plan.model'
import {Student} from './user.model'

export type EvaluationProperty = 'bool' | 'int'

export const allPropertyTypes = (): Array<EvaluationProperty> => ['bool', 'int']

export interface ReportCardEvaluationPattern {
    labwork: string,
    entryType: EntryType,
    min: number,
    property: EvaluationProperty,
    id: string
}

export type ReportCardEvaluationPatternProtocol = Omit<ReportCardEvaluationPattern, 'id'>

export interface ReportCardEvaluationAtomJSON {
    student: Student,
    label: string,
    bool: boolean,
    int: number,
    lastModified: string,
    id: string
}

export interface ReportCardEvaluationAtom {
    student: Student,
    label: string,
    bool: boolean,
    int: number,
    lastModified: Date,
    id: string
}
