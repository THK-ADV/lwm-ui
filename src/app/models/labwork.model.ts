import { Semester, SemesterJSON } from "./semester.model"
import { CourseAtom } from "./course.model"
import { Degree } from "./degree.model"

export interface Labwork {
  label: string
  description: string
  semester: string
  course: string
  degree: string
  subscribable: boolean
  published: boolean
  id: string
}

export interface LabworkAtom {
  label: string
  description: string
  semester: Semester
  course: CourseAtom
  degree: Degree
  subscribable: boolean
  published: boolean
  id: string
}

export interface LabworkAtomJSON {
  label: string
  description: string
  semester: SemesterJSON
  course: CourseAtom
  degree: Degree
  subscribable: boolean
  published: boolean
  id: string
}

export interface LabworkProtocol {
  label: string
  description: string
  semester: string
  course: string
  degree: string
  subscribable: boolean
  published: boolean
}
