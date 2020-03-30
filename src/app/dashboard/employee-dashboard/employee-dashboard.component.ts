import {Component, OnDestroy, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {EmployeeDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {ActivatedRoute, Router} from '@angular/router'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {eventTitle, ScheduleEntryEvent, scheduleEntryProps} from '../../labwork-chain/schedule/view/schedule-view-model'
import {color, whiteColor, chipColorPalette} from '../../utils/colors'
import {Time} from '../../models/time.model'
import {_groupBy, first, mapUndefined, subscribe} from '../../utils/functions'
import {CourseAtom} from '../../models/course.model'

const getRandomColor = () => {
    const colorPalette = chipColorPalette;
    return colorPalette[Math.floor(Math.random() * 8)]
}


@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {

    dashboard: EmployeeDashboard
    courses: { course: CourseAtom, color: string }[]

    private subs: Subscription[]
    private status = true

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
        this.subs = []
    }

    ngOnInit() {
        this.subs.push(subscribe(this.dashboardService.getEmployeeDashboard(), d => {
            this.dashboard = d
            this.courses = this.currentCourses(d.scheduleEntries).map(c => ({course: c, color: getRandomColor()}))
            console.log(this.courses)
        }))
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    calendarEvents = (scheduleEntries: ScheduleEntryAtom[]): () => ScheduleEntryEvent<ScheduleEntryAtom>[] => () => {
        const go = (e: ScheduleEntryAtom): ScheduleEntryEvent<ScheduleEntryAtom> => {
            const backgroundColor = this.courses.find(_ => _.course.id === e.labwork.course.id)?.color ?? color('primary')
            const foregroundColor = whiteColor()

            return {
                allDay: false,
                start: Time.withNewDate(e.date, e.start).date,
                end: Time.withNewDate(e.date, e.end).date,
                title: eventTitle('month', scheduleEntryProps(e.supervisor, e.room, e.group)),
                borderColor: backgroundColor,
                backgroundColor: backgroundColor,
                textColor: foregroundColor,
                extendedProps: e
            }
        }

        return scheduleEntries.map(go)
    }

    onEventClick = (event: ScheduleEntryEvent<ScheduleEntryAtom>) => {
        if (!event.extendedProps) {
            return
        }

        // https://stackoverflow.com/questions/36320821/passing-multiple-route-params-in-angular2
        // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
        // this.router.navigate(['e/courses/:cid/scheduleEntries/:sid', {cid: e.labwork.course.id, sid: e.id}])
        this.router.navigate(
            [`courses/${event.extendedProps.labwork.course.id}/scheduleEntries/${event.extendedProps.id}`],
            {relativeTo: this.route}
            // {state: {scheduleEntry: e}}
        )
    }

    private currentCourses = (scheduleEntries: ScheduleEntryAtom[]) => {
        const obj = _groupBy(scheduleEntries, e => e.labwork.course.id)
        const courses: CourseAtom[] = []

        Object.keys(obj).forEach(k => {
            mapUndefined<ScheduleEntryAtom, {}>(
                first(obj[k]),
                f => courses.push(f.labwork.course)
            )
        })

        return courses
    }

    selectionChange = () => this.status = !this.status
}
