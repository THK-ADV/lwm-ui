import {Observable} from 'rxjs'
import {StudentAtom} from '../models/user.model'
import {HttpService} from '../services/http.service'

export type Criteria =
    'applications' |
    'degree' |
    'lastname' |
    'passedAssignment' |
    'failedAssignment'

export const allCriteria = (): Criteria[] => [
    'applications',
    'degree',
    'lastname',
    'passedAssignment',
    'failedAssignment'
]

type Key =
    'labwork' |
    'semester' |
    'degree' |
    'lastname' |
    'passedAssignment' |
    'failedAssignment'

type Operator = 'and' | 'or'

export interface Single {
    key: Key
    value: string
}

interface Combined {
    lhs: Combined
    rhs: Combined
    operator: Operator
}

interface Expression {
    tag: 'single' | 'combined'
    value: Single | Combined
}

const single = (key: Key, value: string): Expression =>
    ({tag: 'single', value: {key: key, value: value}})

export const performQuery = (criteria: Single[], http: HttpService): Observable<StudentAtom[]> => {
    const makeExpr = (): Expression => {
        if (criteria.length === 1) {
            return single(criteria[0].key, criteria[0].value)
        } else {
            return {tag: 'combined', value: {}}
        }
    }
}

