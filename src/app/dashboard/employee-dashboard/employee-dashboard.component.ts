import {Component, OnDestroy, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {Subscription} from 'rxjs'
import {ActivatedRoute, Router} from '@angular/router'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {first, mapUndefined, nonEmpty, subscribe} from '../../utils/functions'
import {CourseAtom} from '../../models/course.model'
import {Card} from '../../card-list/card-list.component'
import {CalendarView, ScheduleEntryEvent, scheduleEntryEventTitleLong} from '../../labwork-chain/schedule/view/schedule-view-model'
import {colorForCourse} from '../../utils/course-colors'
import {whiteColor} from '../../utils/colors'
import {Time} from '../../models/time.model'
import {forEachMap, groupBy} from '../../utils/group-by'
import {Semester} from '../../models/semester.model'

export const employeeDashboardScheduleEntryEvents = (scheduleEntries: ScheduleEntryAtom[]): ScheduleEntryEvent<ScheduleEntryAtom>[] => {
    const go = (e: ScheduleEntryAtom): ScheduleEntryEvent<ScheduleEntryAtom> => {
        const backgroundColor = colorForCourse(e.labwork.course.id)
        const foregroundColor = whiteColor()

        return {
            allDay: false,
            start: Time.withNewDate(e.date, e.start).date,
            end: Time.withNewDate(e.date, e.end).date,
            title: scheduleEntryEventTitleLong('month', e),
            borderColor: backgroundColor,
            backgroundColor: backgroundColor,
            textColor: foregroundColor,
            extendedProps: e
        }
    }

    return scheduleEntries.map(go)
}

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss'],
    standalone: false
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {

    semester: Semester
    entries: ScheduleEntryEvent<ScheduleEntryAtom>[] = []
    currentCourses: CourseAtom[] = []

    private subs: Subscription[]

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
        this.subs = []
    }

    ngOnInit() {
        this.fetchDashboard(true)
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    cards = (xs: ScheduleEntryAtom[]): Card<CourseAtom, ScheduleEntryAtom>[] => {
        const cards: Card<CourseAtom, ScheduleEntryAtom>[] = []

        forEachMap(groupBy(xs, _ => _.labwork.course.id), (_, value) => {
            if (nonEmpty(value)) {
                cards.push({value: value[0].labwork.course, entries: value})
            }
        })

        return cards
    }

    eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<ScheduleEntryAtom>>) =>
        e.extendedProps && scheduleEntryEventTitleLong(view, e.extendedProps) || e.title

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

    ownEntriesOnlyDidChange = (ownEntriesOnly: boolean) => {
        this.fetchDashboard(ownEntriesOnly)
    }

    private fetchDashboard = (ownEntriesOnly: boolean) => {
        this.subs.push(subscribe(
            this.dashboardService.getEmployeeDashboard(
                {
                    attribute: 'ownEntriesOnly',
                    value: ownEntriesOnly.toString()
                },
                {
                    attribute: 'entriesSinceNow',
                    value: 'false'
                }
            ),
            dashboard => {
                this.semester = dashboard.semester
                this.entries = employeeDashboardScheduleEntryEvents(dashboard.scheduleEntries)
                this.currentCourses = this.getCurrentCourses(dashboard.scheduleEntries)
            }))
    }

    private getCurrentCourses = (scheduleEntries: ScheduleEntryAtom[]) => {
        const courses: CourseAtom[] = []
        forEachMap(groupBy(scheduleEntries, e => e.labwork.course.id), (k, v) => {
            mapUndefined(first(v), f => courses.push(f.labwork.course))
        })
        return courses
    }

    routeToCourse = (course: CourseAtom) => {
        this.router.navigate(
            [`courses/${course.id}`],
            {relativeTo: this.route}
        )
    }
}
