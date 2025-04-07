import { Injectable } from '@angular/core'
import { atomicParams, HttpService, nonAtomicParams } from './http.service'
import { Observable } from 'rxjs'
import {
  ReportCardEvaluationAtom,
  ReportCardEvaluationAtomJSON,
  ReportCardEvaluationJSON,
} from '../models/report-card-evaluation'
import { makePath } from "../utils/component.utils"
import { map, tap } from "rxjs/operators"
import { convertManyReportCardEvaluations } from "../utils/http-utils"

@Injectable({
  providedIn: "root",
})
export class ReportCardEvaluationService {
  constructor(private readonly http: HttpService) {}

  private path = "reportCardEvaluations"

  create = (
    courseId: string,
    labworkId: string,
  ): Observable<ReportCardEvaluationAtom[]> =>
    this.http
      .create<
        Object,
        ReportCardEvaluationAtomJSON[]
      >(makePath(this.path, courseId, labworkId), {}, atomicParams)
      .pipe(
        tap((xs) => console.log(xs)),
        map(convertManyReportCardEvaluations),
      )

  getAll = (
    courseId: string,
    labworkId: string,
  ): Observable<ReportCardEvaluationAtom[]> =>
    this.http
      .getAll<ReportCardEvaluationAtomJSON>(
        makePath(this.path, courseId, labworkId),
        atomicParams,
      )
      .pipe(map(convertManyReportCardEvaluations))

  download = (courseId: string, labworkId: string): Observable<Blob> =>
    this.http.downloadXlsSheet(
      makePath(this.path, courseId, labworkId) + "/sheet",
    )

  fastForward = (
    courseId: string,
    labworkId: string,
    student: string,
  ): Observable<ReportCardEvaluationJSON[]> =>
    this.http.create(
      `/courses/${courseId}/labworks/${labworkId}/students/${student}/reportCardEvaluations`,
      { explicitEval: "fastForward" },
      nonAtomicParams,
    )

  fire = (
    courseId: string,
    labworkId: string,
    student: string,
  ): Observable<ReportCardEvaluationJSON[]> =>
    this.http.create(
      `/courses/${courseId}/labworks/${labworkId}/students/${student}/reportCardEvaluations`,
      { explicitEval: "fire" },
      nonAtomicParams,
    )
}
