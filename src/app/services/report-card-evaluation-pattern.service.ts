import { Injectable } from "@angular/core"
import { HttpService } from "./http.service"
import { Observable } from "rxjs"
import {
  ReportCardEvaluationPattern,
  ReportCardEvaluationPatternProtocol,
} from "../models/report-card-evaluation"
import { makePath } from "../utils/component.utils"
import { applyFilter } from "./http.filter"

@Injectable({
  providedIn: "root",
})
export class ReportCardEvaluationPatternService {
  constructor(private readonly http: HttpService) {}

  private path = "reportCardEvaluationPatterns"

  getAll = (
    courseId: string,
    labworkId: string,
  ): Observable<ReportCardEvaluationPattern[]> =>
    this.http.getAll(
      makePath(this.path, courseId),
      applyFilter([{ attribute: "labwork", value: labworkId }]),
    )

  delete = (
    id: string,
    courseId: string,
  ): Observable<ReportCardEvaluationPattern> =>
    this.http.delete(makePath(this.path, courseId), id)

  create = (
    pattern: ReportCardEvaluationPatternProtocol,
    courseId: string,
  ): Observable<ReportCardEvaluationPattern> =>
    this.http.create(makePath(this.path, courseId), pattern)

  update = (
    pattern: ReportCardEvaluationPatternProtocol,
    id: string,
    courseId: string,
  ): Observable<ReportCardEvaluationPattern> =>
    this.http.put(makePath(this.path, courseId), id, pattern)
}
