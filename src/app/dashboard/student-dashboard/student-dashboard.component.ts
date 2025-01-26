import { Component, OnDestroy, OnInit } from "@angular/core"
import { DashboardService } from "../../services/dashboard.service"
import { StudentDashboard } from "../../models/dashboard.model"
import { Subscription } from "rxjs"
import { distinctBy, filterIsDefined, subscribe } from "../../utils/functions"
import { CourseAtom } from "../../models/course.model"
import { ActivatedRoute, Router } from "@angular/router"

@Component({
  selector: "app-student-dashboard",
  templateUrl: "./student-dashboard.component.html",
  styleUrls: ["./student-dashboard.component.scss"],
  standalone: false,
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  dashboard: StudentDashboard
  courses: CourseAtom[] = []

  private sub: Subscription

  constructor(
    private readonly service: DashboardService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.sub = subscribe(
      this.service.getStudentDashboard({
        attribute: "entriesSinceNow",
        value: "false",
      }),
      this.updateUI,
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  private updateUI = (d: StudentDashboard) => {
    this.dashboard = d
    const sCourses = distinctBy(
      d.scheduleEntries,
      (s) => s.labwork.course.id,
    ).map((a) => a.labwork.course)
    const rCourses = distinctBy(
      d.reportCardEntries,
      ([e]) => e.labwork.course,
    ).map(
      ([e]) =>
        d.labworkApplications.find(
          (_) => _.labwork.course.id === e.labwork.course,
        )?.labwork?.course,
    )

    this.courses = sCourses.concat(filterIsDefined(rCourses))
  }

  routeToReportCards = (course: CourseAtom) => {
    const app = this.dashboard.labworkApplications.find(
      (a) => a.labwork.course.id === course.id,
    )

    if (!app) {
      // students can only route to their report-cards. thus, an applicant must exists.
      return
    }

    this.router.navigate(
      [`reportCards/labworks/${app.labwork.id}/students/${app.applicant.id}`],
      { relativeTo: this.route },
    )
  }
}
