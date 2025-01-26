import { Degree } from "./degree.model"

export interface User {
  systemId: string
  lastname: string
  firstname: string
  email: string
  id: string
}

// tslint:disable-next-line:no-empty-interface
export interface Employee extends User {}

// tslint:disable-next-line:no-empty-interface
export interface Lecturer extends User {}

export interface StudentAtom extends User {
  registrationId: String
  enrollment: Degree
}

export interface Student extends User {
  registrationId: String
  enrollment: String
}
