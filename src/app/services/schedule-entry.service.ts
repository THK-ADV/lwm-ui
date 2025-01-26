import { Injectable } from "@angular/core"
import { atomicParams, HttpService } from "./http.service"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import {
  convertManyScheduleEntries,
  mapScheduleEntryAtomJSON,
} from "../utils/http-utils"
import {
  ScheduleEntryAtom,
  ScheduleEntryAtomJSON,
} from "../models/schedule-entry.model"
import { makePath } from "../utils/component.utils"
import { Time } from "../models/time.model"
import { Group } from "../models/group.model"
import { applyFilter, ParamFilter } from "./http.filter"
import { GroupStrategy } from "../labwork-chain/group/preview/group-preview-view-model"
import { parseUnsafeString } from "../utils/functions"

export interface SchedulePreview {
  schedule: ScheduleGen
  conflicts: Conflict[]
  "conflict value": number
  fitness: number
}

export interface ScheduleGen {
  labwork: string
  entries: ScheduleEntryGen[]
}

export interface ScheduleGenProtocol {
  labwork: string
  entries: ScheduleEntryGenProtocol[]
}

export interface ScheduleEntryGen {
  start: Time
  end: Time
  date: Date
  room: string
  supervisor: string[]
  group: Group
}

export interface ScheduleEntryGenProtocol {
  start: string
  end: string
  date: string
  room: string
  supervisor: string[]
  group: Group
}

export interface ScheduleEntryGenJSON {
  start: string
  end: string
  date: string
  room: string
  supervisor: string[]
  group: Group
}

export interface Conflict {
  entry: ScheduleEntryGen
  members: string[]
  group: Group
}

@Injectable({
  providedIn: "root",
})
export class ScheduleEntryService {
  constructor(private readonly http: HttpService) {}

  private readonly path = (course: string, labwork?: string) =>
    makePath("scheduleEntries", course, labwork)

  getAllWithFilter = (
    courseId: string,
    labworkId: string,
  ): Observable<ScheduleEntryAtom[]> =>
    this.http
      .getAll<ScheduleEntryAtomJSON>(
        this.path(courseId, labworkId),
        atomicParams,
      )
      .pipe(map(convertManyScheduleEntries))

  get = (courseId: string, id: string): Observable<ScheduleEntryAtom> =>
    this.http
      .get<ScheduleEntryAtomJSON>(this.path(courseId), id, atomicParams)
      .pipe(map(mapScheduleEntryAtomJSON))

  preview = (
    courseId: string,
    labworkId: string,
    strategy: GroupStrategy,
    considerSemesterIndex: boolean,
  ): Observable<SchedulePreview> =>
    this.http
      .get_(
        makePath("scheduleEntries/preview", courseId, labworkId),
        applyFilter(
          this.groupStrategy(strategy).concat({
            attribute: "considerSemesterIndex",
            value: parseUnsafeString(considerSemesterIndex),
          }),
        ),
      )
      .pipe(map(this.mapDateTime))

  create = (
    courseId: string,
    protocol: ScheduleGenProtocol,
  ): Observable<ScheduleEntryAtom[]> =>
    this.http
      .create<
        ScheduleGenProtocol,
        ScheduleEntryAtomJSON[]
      >(this.path(courseId), protocol, atomicParams)
      .pipe(map(convertManyScheduleEntries))

  delete = (courseId: string, labworkId: string): Observable<unknown> =>
    this.http.delete_(this.path(courseId, labworkId))

  private groupStrategy = (strategy: GroupStrategy): ParamFilter[] => {
    switch (strategy.kind) {
      case "min-max":
        return [
          { attribute: "min", value: strategy.min.toString() },
          { attribute: "max", value: strategy.max.toString() },
        ]
      case "count":
        return [{ attribute: "count", value: strategy.count.toString() }]
    }
  }

  private mapDateTime = (p: SchedulePreview): SchedulePreview => {
    const entries = p.schedule.entries.map((e) => {
      const date = new Date(e.date)

      return {
        ...e,
        date: date,
        start: Time.fromTimeString(parseUnsafeString(e.start), date),
        end: Time.fromTimeString(parseUnsafeString(e.end), date),
      }
    })
    const s = { ...p.schedule, entries: entries }
    return { ...p, schedule: s }
  }
}
