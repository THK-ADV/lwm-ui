export interface AssignmentEntry {
    labwork: string,
    index: number,
    label: string
    types: AssignmentEntryType[]
    duration: number,
    id: string
}

export interface AssignmentEntryProtocol {
    labwork: string,
    label: string
    types: AssignmentEntryType[]
    duration: number
}

export interface AssignmentEntryType {
    entryType: AssignmentEntryTypeValue
}

export enum AssignmentEntryTypeValue {
    attendance = 'Anwesenheitspflichtig',
    certificate = 'Testat',
    bonus = 'Bonus',
    supplement = 'Zusatzleistung'
}

export const orderingOfEntryTypeValue = (value: Readonly<AssignmentEntryTypeValue>): number => {
    switch (value) {
        case AssignmentEntryTypeValue.attendance:
            return 0
        case AssignmentEntryTypeValue.certificate:
            return 1
        case AssignmentEntryTypeValue.bonus:
            return 2
        case AssignmentEntryTypeValue.supplement:
            return 3

    }
}
export const stringToAssignmentEntryTypeValue = (s: string): AssignmentEntryTypeValue | undefined => {
    switch (s) {
        case AssignmentEntryTypeValue.attendance:
            return AssignmentEntryTypeValue.attendance
        case AssignmentEntryTypeValue.certificate:
            return AssignmentEntryTypeValue.certificate
        case AssignmentEntryTypeValue.bonus:
            return AssignmentEntryTypeValue.bonus
        case AssignmentEntryTypeValue.supplement:
            return AssignmentEntryTypeValue.supplement
        default:
            return undefined
    }
}

export const assignmentEntryTypeSortingF = (a: AssignmentEntryTypeValue, b: AssignmentEntryTypeValue): number =>
    orderingOfEntryTypeValue(a) - orderingOfEntryTypeValue(b)

export const sortedAssignmentPlanEntryTypes = (e: Readonly<AssignmentEntry>): AssignmentEntry => { // TODO test
    const sorted = e.types.sort((lhs, rhs) => assignmentEntryTypeSortingF(lhs.entryType, rhs.entryType))
    return {...e, types: sorted}
}

export const findEntryTypeValue = (types: Readonly<AssignmentEntryType[]>, value: Readonly<AssignmentEntryTypeValue>)
    : AssignmentEntryType | undefined => {
    return types.find(t => t.entryType === value)
}

export const hasEntryTypeValue = (types: Readonly<AssignmentEntryType[]>, value: Readonly<AssignmentEntryTypeValue>): boolean => {
    return findEntryTypeValue(types, value) !== undefined
}
