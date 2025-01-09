import { Labwork } from "./labwork.model"
import { User } from "./user.model"

export interface Group {
  label: string
  labwork: string
  members: string[]
  id: string
}

export interface GroupAtom {
  label: string
  labwork: Labwork
  members: User[]
  id: string
}
