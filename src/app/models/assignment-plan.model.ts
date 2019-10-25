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

const orderingOfEntryTypeValue = (value: Readonly<AssignmentEntryTypeValue>): number => {
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

export const sortedAssignmentPlanEntryTypes = (e: Readonly<AssignmentEntry>): AssignmentEntry => {
    const sorted = e.types.sort((lhs, rhs) => {
        return orderingOfEntryTypeValue(lhs.entryType) - orderingOfEntryTypeValue(rhs.entryType)
    })

    return {...e, types: sorted}
}

export const findEntryTypeValue = (types: Readonly<AssignmentEntryType[]>, value: Readonly<AssignmentEntryTypeValue>)
    : AssignmentEntryType | undefined => {
    return types.find(t => t.entryType === value)
}

export const hasEntryTypeValue = (types: Readonly<AssignmentEntryType[]>, value: Readonly<AssignmentEntryTypeValue>): boolean => {
    return findEntryTypeValue(types, value) !== undefined
}
