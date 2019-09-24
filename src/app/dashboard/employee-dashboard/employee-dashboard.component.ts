import { Component, OnDestroy, OnInit } from '@angular/core'
import { DashboardService } from '../../services/dashboard.service'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { Semester } from 'src/app/models/semester.model'
import { CourseAtom } from 'src/app/models/course.model'
import { EmployeeDashboard } from 'src/app/models/dashboard.model'
import { ScheduleEntryLike } from 'src/app/labwork-chain/abstract-group-view/abstract-group-view.component'
import { isEmpty } from 'src/app/utils/functions'


@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
    private dashboardSubscription: Subscription
    private dashboard: EmployeeDashboard
    private semester: Semester
    private courses: CourseAtom[] | undefined
    private scheduleEntries: ScheduleEntryLike[]


    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        this.dashboardSubscription = this.dashboardService.getDashboard<EmployeeDashboard>()
            .subscribe(dashboard => {
                this.dashboard = dashboard
                this.semester = dashboard.semester
                this.courses = (dashboard.courses) ? dashboard.courses.sort((lhs, rhs) => lhs.label.localeCompare(rhs.label)) : []
                this.scheduleEntries = (dashboard.scheduleEntries) ? dashboard.scheduleEntries : []
            })
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe()
    }

    getColor = (course: CourseAtom) => {
        return (!isEmpty(this.scheduleEntries)) ? 'darkgrey' : 'green'
    }


}
