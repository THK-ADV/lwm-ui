import {EntryType} from './assignment-plan.model'
import {Student} from './user.model'
import {ExplicitEvaluationKind} from '../services/lwm.service'

export type EvaluationProperty = 'bool' | 'int'

export const allPropertyTypes = (): Array<EvaluationProperty> => ['bool', 'int']

const isFastForward = (int: number) => int === 3201

const isFired = (int: number) => int === 3207

export const fastForwarded = (evals: ReportCardEvaluationJSON[]): boolean =>
    evals.every(_ => isFastForward(_.int))

export const fired = (evals: ReportCardEvaluationJSON[]): boolean =>
    evals.every(_ => isFired(_.int))

export const explicitEvaluationKind = (evals: Readonly<ReportCardEvaluationAtom[]>): ExplicitEvaluationKind | undefined => {
    if (evals.every(_ => isFastForward(_.int))) {
        return 'fastForward'
    } else if (evals.every(_ => isFired(_.int))) {
        return 'fire'
    } else {
        return undefined
    }
}

export interface ReportCardEvaluationPattern {
    labwork: string,
    entryType: EntryType,
    min: number,
    property: EvaluationProperty,
    id: string
}

export type ReportCardEvaluationPatternProtocol = Omit<ReportCardEvaluationPattern, 'id'>

export interface ReportCardEvaluationJSON {
    student: string,
    label: string,
    bool: boolean,
    int: number,
    lastModified: string,
    id: string
}

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
