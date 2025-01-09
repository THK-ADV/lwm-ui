import { Component } from "@angular/core"
import {
  Creatable,
  TableHeaderColumn,
} from "../abstract-crud/abstract-crud.component"
import { Observable } from "rxjs"
import { CourseAtom } from "../models/course.model"
import { CourseProtocol, CourseService } from "../services/course.service"
import {
  emptyCourseProtocol,
  partialCourseFormInputData,
} from "../utils/component.utils"
import { UserService } from "../services/user.service"

@Component({
  selector: "lwm-course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.scss"],
  standalone: false,
})
export class CourseComponent {
  columns: TableHeaderColumn[]
  tableContent: (model: Readonly<CourseAtom>, attr: string) => string
  courses$: Observable<CourseAtom[]>
  creatable: Creatable<CourseProtocol, CourseAtom>

  constructor(
    private readonly courseService: CourseService,
    private readonly userService: UserService,
  ) {
    this.columns = [
      { attr: "label", title: "Bezeichnung" },
      { attr: "description", title: "Beschreibung" },
      { attr: "abbreviation", title: "Abkürzung" },
      { attr: "lecturer", title: "Dozent" },
      { attr: "semesterIndex", title: "Fachsemester" },
    ]

    this.tableContent = (c, attr) => {
      switch (attr) {
        case "lecturer":
          return `${c.lecturer.lastname}, ${c.lecturer.firstname}`
        default:
          return c[attr]
      }
    }

    this.courses$ = courseService.getAll()
    this.creatable = {
      dialogTitle: "Modul",
      emptyProtocol: emptyCourseProtocol,
      makeInput: partialCourseFormInputData(userService),
      commitProtocol: (p, s) => ({
        ...p,
        label: s?.label ?? p.label,
        lecturer: s?.lecturer?.id ?? p.lecturer,
      }),
      create: courseService.create,
      update: courseService.update,
    }
  }
}
