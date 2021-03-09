import {Room} from './room.model'
import {Time} from './time.model'

export type RescheduleReason = 'Krankheit' | 'Terminkollision' | 'Privat' | 'Sonstiges' | 'Erneuter Versuch' | 'Defizit'

export interface ReportCardRescheduledAtom {
    date: Date
    start: Time
    end: Time
    room: Room
    reason?: RescheduleReason
    id: string
}

export interface ReportCardRescheduledAtomJSON {
    date: string
    start: string
    end: string
    room: Room
    reason?: RescheduleReason
    id: string
}

export interface ReportCardRescheduledProtocol {
    reportCardEntry: string
    date: string
    start: string
    end: string
    room: string
    reason?: RescheduleReason
}
