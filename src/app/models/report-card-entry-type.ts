import {EntryType} from './entry-type'

export interface ReportCardEntryType {
    entryType: EntryType
    bool?: boolean
    int: number
    id: string
}
