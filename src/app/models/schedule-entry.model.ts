import {LabworkAtom} from './labwork.model'
import {Time} from './time.model'
import {Room} from './room.model'
import {User} from './user.model'
import {Group} from './group.model'

export interface ScheduleEntryLike {
    group: Group
    date: Date
    start: Time
    end: Time
}

export interface ScheduleEntryAtom extends ScheduleEntryLike {
    labwork: LabworkAtom
    room: Room
    supervisor: User[]
    id: string
}

export interface ScheduleEntryAtomJSON {
    labwork: LabworkAtom
    start: string
    end: string
    date: string
    room: Room
    supervisor: User[]
    group: Group
    id: string
}

