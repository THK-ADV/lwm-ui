import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {EmployeeDashboard} from '../../models/dashboard.model'
import {Observable} from 'rxjs'
import {ActivatedRoute, Router} from '@angular/router'
import {_groupBy, dateOrderingASC, first} from '../../utils/functions'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {LabworkAtom} from '../../models/labwork.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {KeyValue} from '@angular/common'
import {CourseAtom} from '../../models/course.model'

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {

    dashboard$: Observable<EmployeeDashboard>

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
    }

    ngOnInit() {
        this.dashboard$ = this.dashboardService.getEmployeeDashboard()
    }

    groupByLabworks = (xs: ScheduleEntryAtom[]): KeyValue<string, ScheduleEntryAtom[]> =>
        _groupBy(xs, x => x.labwork.id)

    labworkBy = (xs: ScheduleEntryAtom[]): LabworkAtom | undefined =>
        first(xs)?.labwork

    displayScheduleEntry = (e: ScheduleEntryAtom) =>
        `${format(e.date, 'dd.MM.yyyy')} ${formatTime(e.start, 'HH:mm')} - ${formatTime(e.end, 'HH:mm')} Gruppe ${e.group.label} in ${e.room.label}`

    sortScheduleEntries = () => (lhs: ScheduleEntryAtom, rhs: ScheduleEntryAtom) =>
        dateOrderingASC(lhs.start.date, rhs.start.date)

    onScheduleEntry = (e: ScheduleEntryAtom) => {
        // https://stackoverflow.com/questions/36320821/passing-multiple-route-params-in-angular2
        // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
        // this.router.navigate(['e/courses/:cid/scheduleEntries/:sid', {cid: e.labwork.course.id, sid: e.id}])
        this.router.navigate(
            [`courses/${e.labwork.course.id}/scheduleEntries/${e.id}`],
            {relativeTo: this.route}
            // {state: {scheduleEntry: e}}
        )
    }

    scheduleEntryHeaderTitle = (d: EmployeeDashboard) =>
        `Staffelpläne für ${d.semester.label}`

    courseHeaderTitle = () =>
        'Module'

    displayCourse = (c: CourseAtom) =>
        c.label

    onCourse = (c: CourseAtom) =>
        this.router.navigate([`courses`, c.id], {relativeTo: this.route})

    sortCourses = () => (lhs: CourseAtom, rhs: CourseAtom) =>
        lhs.label.localeCompare(rhs.label)
}
