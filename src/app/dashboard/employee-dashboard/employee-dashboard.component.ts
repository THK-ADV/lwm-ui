import {Component, OnDestroy, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {EmployeeDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {ActivatedRoute, Router} from '@angular/router'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {_groupBy, nonEmpty, subscribe} from '../../utils/functions'
import {CourseAtom} from '../../models/course.model'
import {Card} from '../../card-list/card-list.component'
import {format, formatTime} from '../../utils/lwmdate-adapter'

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {

    dashboard: EmployeeDashboard

    private subs: Subscription[]

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
        this.subs = []
    }

    // colorForCourse_ = colorForCourse

    ngOnInit() {
        this.subs.push(subscribe(this.dashboardService.getEmployeeDashboard(), d => this.dashboard = d))
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    cards = (xs: ScheduleEntryAtom[]): Card<CourseAtom, ScheduleEntryAtom>[] => {
        const cards: Card<CourseAtom, ScheduleEntryAtom>[] = []

        Object
            .values(_groupBy(xs, _ => _.labwork.course.id))
            .forEach(value => {
                value = value as ScheduleEntryAtom[]

                if (nonEmpty(value)) {
                    cards.push({value: value[0].labwork.course, entries: value})
                }
            })

        return cards
    }

    courseTitle = (c: CourseAtom) =>
        c.abbreviation

    scheduleEntryTitle = (x: ScheduleEntryAtom) =>
        `${format(x.date, 'dd.MM')} ${formatTime(x.start, 'HH:mm')}-${formatTime(x.end, 'HH:mm')}: ${x.labwork.label} ${x.room.label} [${x.group.label}]`

    showReportCardEntries = (x: ScheduleEntryAtom) =>
        this.router.navigate(
            [`courses/${x.labwork.course.id}/scheduleEntries/${x.id}`],
            {relativeTo: this.route}
        )

    // calendarEvents = (scheduleEntries: ScheduleEntryAtom[]): () => ScheduleEntryEvent<ScheduleEntryAtom>[] => () => {
    //     const go = (e: ScheduleEntryAtom): ScheduleEntryEvent<ScheduleEntryAtom> => {
    //         const backgroundColor = colorForCourse(e.labwork.course.id)
    //         const foregroundColor = whiteColor()
    //
    //         return {
    //             allDay: false,
    //             start: Time.withNewDate(e.date, e.start).date,
    //             end: Time.withNewDate(e.date, e.end).date,
    //             title: eventTitle('month', scheduleEntryProps(e.supervisor, e.room, e.group)),
    //             borderColor: backgroundColor,
    //             backgroundColor: backgroundColor,
    //             textColor: foregroundColor,
    //             extendedProps: e
    //         }
    //     }
    //
    //     return scheduleEntries.map(go)
    // }

    // eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<ScheduleEntryAtom>>) =>
    //     foldUndefined(e.extendedProps, p => eventTitle(view, scheduleEntryProps(p.supervisor, p.room, p.group)), () => e.title)

    // onEventClick = (event: ScheduleEntryEvent<ScheduleEntryAtom>) => {
    //     if (!event.extendedProps) {
    //         return
    //     }
    //
    //     // https://stackoverflow.com/questions/36320821/passing-multiple-route-params-in-angular2
    //     // https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
    //     // this.router.navigate(['e/courses/:cid/scheduleEntries/:sid', {cid: e.labwork.course.id, sid: e.id}])
    //     this.router.navigate(
    //         [`courses/${event.extendedProps.labwork.course.id}/scheduleEntries/${event.extendedProps.id}`],
    //         {relativeTo: this.route}
    //         // {state: {scheduleEntry: e}}
    //     )
    // }

    // private currentCourses = (scheduleEntries: ScheduleEntryAtom[]) => {
    //     const obj = _groupBy(scheduleEntries, e => e.labwork.course.id)
    //     const courses: CourseAtom[] = []
    //
    //     Object.keys(obj).forEach(k => {
    //         mapUndefined<ScheduleEntryAtom, {}>(
    //             first(obj[k]),
    //             f => courses.push(f.labwork.course)
    //         )
    //     })
    //
    //     return courses
    // }
}
