import { LabworkAtom } from "./labwork.model"
import { Time } from "./time.model"
import { Room } from "./room.model"
import { User } from "./user.model"
import { Group } from "./group.model"

export interface ScheduleEntryAtom {
  labwork: LabworkAtom
  start: Time
  end: Time
  date: Date
  room: Room
  supervisor: User[]
  group: Group
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
