import { Injectable } from "@angular/core"
import { HttpService, nonAtomicParams } from "./http.service"
import { Role } from "../models/role.model"
import { Observable } from "rxjs"
import { applyFilter } from "./http.filter"
import { makePath } from "../utils/component.utils"

@Injectable({
  providedIn: "root",
})
export class RoleService {
  constructor(private http: HttpService) {}

  private readonly path = "roles"

  courseRelatedRoles = (courseId: string): Observable<Role[]> =>
    this.http.getAll<Role>(
      makePath(this.path, courseId),
      applyFilter(
        [{ attribute: "select", value: "courseRelated" }],
        nonAtomicParams,
      ),
    )
}
