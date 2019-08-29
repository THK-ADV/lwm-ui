export interface AssignmentPlan {
    labwork: string
    attendance: number // TODO remove
    mandatory: number // TODO remove
    entries: AssignmentEntry[]
    id: string
}

export interface AssignmentPlanProtocol {
    labwork: string
    attendance: number // TODO remove
    mandatory: number // TODO remove
    entries: AssignmentEntry[]
}

export interface AssignmentEntry {
    index: number,
    label: string
    types: AssignmentEntryType[]
    duration: number
}

export interface AssignmentEntryType { // TODO better: AssignmentEntryTypeProtocol with entryType only
    entryType: AssignmentEntryTypeValue
    bool: boolean
    int: number
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
