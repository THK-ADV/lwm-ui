import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { Employee, Lecturer, StudentAtom, User } from "../models/user.model"
import { atomicParams, HttpService, nonAtomicParams } from "./http.service"
import { applyFilter } from "./http.filter"
import { makePath } from "../utils/component.utils"

interface UserFilter {
  attribute: "status" | "degree"
  value: string
}

export interface BuddyResult {
  type: string
  buddy: User
  message: string
}

export interface StudentProtocol {
  systemId: string
  lastname: string
  firstname: string
  email: string
  registrationId: string
  enrollment: string
}

export interface EmployeeProtocol {
  systemId: string
  lastname: string
  firstname: string
  email: string
}

export const isStudentProtocol = (any: any): any is StudentProtocol => {
  return (any as StudentProtocol)?.enrollment !== undefined
}

export interface Buddy {
  systemId: string
  id: string
}

export const isBuddy = (any: any): any is Buddy => {
  return (
    (any as Buddy)?.id !== undefined && (any as Buddy)?.systemId !== undefined
  )
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpService) {}

  private path = "users"

  getBuddies = (degree: string): Observable<Buddy[]> =>
    this.http.getAll(`${this.path}/buddies/${degree}`, nonAtomicParams)

  getAllWithFilter = (...filter: UserFilter[]): Observable<User[]> =>
    this.http.getAll(this.path, applyFilter(filter, nonAtomicParams))

  allStudentsRestricted = (courseId: string): Observable<User[]> =>
    this.http.getAll(
      makePath(this.path + "/students", courseId),
      nonAtomicParams,
    )

  getAllRestricted = (courseId: string): Observable<User[]> =>
    this.http.getAll(makePath(this.path, courseId), nonAtomicParams)

  getAllAtomic = (): Observable<Array<StudentAtom | Employee | Lecturer>> =>
    this.http.getAll(this.path, atomicParams)

  buddy = (labworkId: string, applicantId: string, buddySystemId: string) =>
    this.http.get_<BuddyResult>(
      `labworks/${labworkId}/${this.path}/${applicantId}/buddies/${buddySystemId}`,
    )

  createFromToken = (): Observable<User> =>
    this.http.create(this.path, {}, nonAtomicParams)
}
