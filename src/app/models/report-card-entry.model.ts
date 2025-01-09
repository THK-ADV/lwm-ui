import { Time } from "./time.model"
import { Room } from "./room.model"
import { User } from "./user.model"
import { Labwork } from "./labwork.model"
import { EntryType } from "./assignment-plan.model"

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
  id: string
}

export interface ReportCardEntryType {
  entryType: EntryType
  bool?: boolean
  int: number
  id: string
}
