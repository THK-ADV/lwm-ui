import {Time} from './time.model'
import {Room} from './room.model'

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
