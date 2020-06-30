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
    entryType: EntryType
}

export type EntryType =
    'Anwesenheitspflichtig' |
    'Testat' |
    'Bonus' |
    'Zusatzleistung'

export const allEntryTypes = (): Array<EntryType> =>
    ['Anwesenheitspflichtig', 'Testat', 'Bonus', 'Zusatzleistung']

export const entryTypeOrdering = (x: EntryType): number => {
    switch (x) {
        case 'Anwesenheitspflichtig':
            return 0
        case 'Testat':
            return 1
        case 'Bonus':
            return 2
        case 'Zusatzleistung':
            return 3
    }
}

export const entryTypeSortingF = (lhs: EntryType, rhs: EntryType): number =>
    entryTypeOrdering(lhs) - entryTypeOrdering(rhs)

export const sortedByEntryTypes = (e: Readonly<AssignmentEntry>): AssignmentEntry => ({
    ...e,
    types: e.types.sort((lhs, rhs) => entryTypeSortingF(lhs.entryType, rhs.entryType))
})
