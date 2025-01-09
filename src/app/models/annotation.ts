import { User } from "./user.model"

export interface Annotation {
  reportCardEntry: string
  author: string
  message: string
  lastModified: Date
  id: string
}

export interface AnnotationAtom {
  reportCardEntry: string
  author: User
  message: string
  lastModified: Date
  id: string
}
