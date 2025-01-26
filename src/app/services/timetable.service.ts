import { Injectable } from "@angular/core"
import { atomicParams, HttpService } from "./http.service"
import { Observable } from "rxjs"
import { makePath } from "../utils/component.utils"
import { applyFilter } from "./http.filter"
import {
  TimetableAtom,
  TimetableAtomJSON,
  TimetableProtocol,
} from "../models/timetable"
import { map } from "rxjs/operators"
import {
  convertManyTimetables,
  mapTimetableAtomJSON,
} from "../utils/http-utils"

interface TimetablePlanFilter {
  attribute: "labwork"
  value: string
}

@Injectable({
  providedIn: "root",
})
export class TimetableService {
  constructor(private readonly http: HttpService) {}

  private readonly path = (course: string) => makePath("timetables", course)

  getAllWithFilter = (
    courseId: string,
    ...filter: TimetablePlanFilter[]
  ): Observable<TimetableAtom[]> =>
    this.http
      .getAll<TimetableAtomJSON>(
        this.path(courseId),
        applyFilter(filter, atomicParams),
      )
      .pipe(map(convertManyTimetables))

  update = (
    courseId: string,
    id: string,
    body: TimetableProtocol,
  ): Observable<TimetableAtom> =>
    this.http
      .put<
        TimetableProtocol,
        TimetableAtomJSON
      >(this.path(courseId), id, body, atomicParams)
      .pipe(map(mapTimetableAtomJSON))

  create = (
    courseId: string,
    body: TimetableProtocol,
  ): Observable<TimetableAtom> =>
    this.http
      .create<
        TimetableProtocol,
        TimetableAtomJSON
      >(this.path(courseId), body, atomicParams)
      .pipe(map(mapTimetableAtomJSON))

  removeBlacklist = (
    courseId: string,
    timetableId: string,
    blacklistId: string,
  ): Observable<TimetableAtom> =>
    this.http
      .delete<TimetableAtomJSON>(
        this.path(courseId),
        `${timetableId}/blacklists/${blacklistId}`,
      )
      .pipe(map(mapTimetableAtomJSON))
}
