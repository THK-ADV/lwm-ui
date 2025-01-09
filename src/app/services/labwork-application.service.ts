import { Injectable } from "@angular/core"
import { atomicParams, HttpService } from "./http.service"
import { Observable } from "rxjs"
import {
  LabworkApplicationAtom,
  LabworkApplicationProtocol,
} from "../models/labwork.application.model"
import { makePath } from "../utils/component.utils"

@Injectable({
  providedIn: "root",
})
export class LabworkApplicationService {
  constructor(private http: HttpService) {}

  private readonly path = "labworkApplications"

  count = (courseId: string, labworkId: string): Observable<number> =>
    this.http.get_(`${makePath(this.path, courseId, labworkId)}/count`)

  getAllByLabwork = (
    courseId: string,
    labworkId: string,
  ): Observable<LabworkApplicationAtom[]> =>
    this.http.getAll(makePath(this.path, courseId, labworkId), atomicParams)

  createForSelf = (
    protocol: LabworkApplicationProtocol,
  ): Observable<LabworkApplicationAtom> =>
    this.http.create(this.path, protocol, atomicParams)

  createForOther = (
    courseId: string,
    protocol: LabworkApplicationProtocol,
  ): Observable<LabworkApplicationAtom> =>
    this.http.create(makePath(this.path, courseId), protocol, atomicParams)

  deleteForSelf = (id: string): Observable<LabworkApplicationAtom> =>
    this.http.delete(this.path, id)

  deleteForOther = (
    courseId: string,
    id: string,
  ): Observable<LabworkApplicationAtom> =>
    this.http.delete(makePath(this.path, courseId), id)

  updateForSelf = (
    protocol: LabworkApplicationProtocol,
    id: string,
  ): Observable<LabworkApplicationAtom> =>
    this.http.put(this.path, id, protocol, atomicParams)

  updateForOther = (
    courseId: string,
    protocol: LabworkApplicationProtocol,
    id: string,
  ): Observable<LabworkApplicationAtom> =>
    this.http.put(makePath(this.path, courseId), id, protocol, atomicParams)

  download = (courseId: string, labworkId: string): Observable<Blob> =>
    this.http.downloadXlsSheet(
      makePath(this.path, courseId, labworkId) + "/sheet",
    )
}
