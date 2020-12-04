import {Room} from './room.model'
import {Time} from './time.model'

export interface ReportCardRescheduledAtom {
    date: Date
    start: Time
    end: Time
    room: Room
    reason?: string
    id: string
}

export interface ReportCardRescheduledAtomJSON {
    date: string
    start: string
    end: string
    room: Room
    reason?: string
    id: string
}

export interface ReportCardRescheduledProtocol {
    reportCardEntry: string
    date: string
    start: string
    end: string
    room: string
    reason?: string
}
