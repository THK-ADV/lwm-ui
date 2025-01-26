import { Component, Input } from "@angular/core"
import { LabworkApplicationAtom } from "../../../models/labwork.application.model"
import { StudentAtom } from "../../../models/user.model"
import { LabworkAtom } from "../../../models/labwork.model"

@Component({
  selector: "lwm-student-dashboard-application",
  templateUrl: "./student-dashboard-application.component.html",
  styleUrls: ["./student-dashboard-application.component.scss"],
  standalone: false,
})
export class StudentDashboardApplicationComponent {
  @Input() student: StudentAtom
  @Input() labworks: LabworkAtom[]
  @Input() labworkApplications: LabworkApplicationAtom[]

  hasLabworksToApplyFor = () =>
    this.labworks.filter((_) => _.subscribable).length > 0

  onApplicationChange = ([app, action]: [
    Readonly<LabworkApplicationAtom>,
    "add" | "delete" | "update",
  ]) => {
    switch (action) {
      case "add":
        this.labworkApplications.push(app)
        break
      case "delete":
        this.labworkApplications = this.labworkApplications.filter(
          (x) => app.id !== x.id,
        )
        break
      case "update":
        this.labworkApplications = this.labworkApplications.map((x) =>
          x.id === app.id ? app : x,
        )
        break
    }
  }
}
