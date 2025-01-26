import { User } from "./user.model"
import { Role } from "./role.model"
import { CourseAtom } from "./course.model"

export interface AuthorityAtom {
  user: User
  role: Role
  course?: CourseAtom
  id: string
}

export interface AuthorityProtocol {
  user: string
  role: string
  course?: string
}
