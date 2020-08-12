import {Time} from './time.model'
import {Room} from './room.model'
import {User} from './user.model'
import {Labwork} from './labwork.model'
import {ReportCardEntryType} from './report-card-entry-type'
import {ReportCardRescheduledAtom, ReportCardRescheduledAtomJSON} from './report-card-rescheduled'
import {ReportCardRetryAtom, ReportCardRetryAtomJSON} from './report-card-retry'

// atom

export interface ReportCardEntryAtom {
    student: User
    labwork: Labwork
    label: string
    date: Date
    start: Time
    end: Time
    room: Room
    entryTypes: ReportCardEntryType[]
    assignmentIndex: number
    rescheduled?: ReportCardRescheduledAtom
    retry?: ReportCardRetryAtom
    id: string
}

export interface ReportCardEntryAtomJSON {
    student: User
    labwork: Labwork
    label: string
    date: string
    start: string
    end: string
    room: Room
    entryTypes: ReportCardEntryType[]
    assignmentIndex: number
    rescheduled?: ReportCardRescheduledAtomJSON
    retry?: ReportCardRetryAtomJSON
    id: string
}

// normal

export interface ReportCardEntry {
    student: string
    labwork: string
    label: string
    date: Date
    start: Time
    end: Time
    room: string
    entryTypes: ReportCardEntryType[]
    assignmentIndex: number
    id: string
}

export interface ReportCardEntryJSON {
    student: string
    labwork: string
    label: string
    date: string
    start: string
    end: string
    room: string
    entryTypes: ReportCardEntryType[]
    assignmentIndex: number
    id: string
}
