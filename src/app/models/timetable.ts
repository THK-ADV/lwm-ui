import { Labwork } from "./labwork.model"
import { Blacklist, BlacklistJSON } from "./blacklist.model"
import { User } from "./user.model"
import { Room } from "./room.model"
import { Time } from "./time.model"

export interface TimetableAtom {
  labwork: Labwork
  entries: TimetableEntryAtom[]
  start: Date
  localBlacklist: Blacklist[]
  id: string
}

export interface TimetableEntryAtom {
  supervisor: User[]
  room: Room
  dayIndex: number
  start: Time
  end: Time
}

export interface TimetableProtocol {
  labwork: string
  entries: TimetableEntryProtocol[]
  start: string
  localBlacklist: string[]
}

export interface TimetableEntryProtocol {
  supervisor: string[]
  room: string
  dayIndex: number
  start: string
  end: string
}

export interface TimetableEntry {
  supervisor: string[]
  room: string
  dayIndex: number
  start: Time
  end: Time
}

export interface TimetableAtomJSON {
  labwork: Labwork
  entries: TimetableEntryAtomJSON[]
  start: string
  localBlacklist: BlacklistJSON[]
  id: string
}

export interface TimetableEntryAtomJSON {
  supervisor: User[]
  room: Room
  dayIndex: number
  start: string
  end: string
}
