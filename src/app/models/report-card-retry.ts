import {Time} from './time.model'
import {Room} from './room.model'
import {ReportCardEntryType} from './report-card-entry-type'

export interface ReportCardRetryAtom {
    date: Date
    start: Time
    end: Time
    room: Room
    entryTypes: ReportCardEntryType[]
    reason?: string
    id: string
}

export interface ReportCardRetryAtomJSON {
    date: string
    start: string
    end: string
    room: Room
    entryTypes: ReportCardEntryType[]
    reason?: string
    id: string
}
