import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {LabworkApplicationAtom} from 'src/app/models/labwork.application.model'
import {_groupBy, nonEmpty, subscribe} from '../../utils/functions'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {ActivatedRoute, Router} from '@angular/router'
import {Card} from '../../card-list/card-list.component'
import {Labwork} from '../../models/labwork.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'

@Component({
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

    dashboard: StudentDashboard

    private subs: Subscription[] = []

    constructor(
        private readonly service: DashboardService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        this.subs.push(subscribe(this.service.getStudentDashboard(), d => this.dashboard = d))
    }

    onApplicationChange = (arg: [Readonly<LabworkApplicationAtom>, ('add' | 'delete' | 'update')]) => {
        const [app, action] = arg

        switch (action) {
            case 'add':
                this.dashboard.labworkApplications.push(app)
                break
            case 'delete':
                this.dashboard.labworkApplications = this.dashboard.labworkApplications.filter(x => app.id !== x.id)
                break
            case 'update':
                this.dashboard.labworkApplications = this.dashboard.labworkApplications.map(x => x.id === app.id ? app : x)
                break
        }
    }

    cards = (xs: ReportCardEntryAtom[]): Card<Labwork, ReportCardEntryAtom>[] => {
        const cards: Card<Labwork, ReportCardEntryAtom>[] = []

        Object
            .values(_groupBy(xs, _ => _.labwork.id))
            .forEach(value => {
                value = value as ReportCardEntryAtom[]

                if (nonEmpty(value)) {
                    cards.push({value: value[0].labwork, entries: value})
                }
            })

        return cards
    }

    labworkTitle = (l: Labwork) =>
        l.label

    reportCardEntryTitle = (x: ReportCardEntryAtom) => {
        const string = `${format(x.date, 'dd.MM')} ${formatTime(x.start, 'HH:mm')}-${formatTime(x.end, 'HH:mm')}: ${x.label}`
        return x.room.label === 'tbd' ? string : `${string} ${x.room.label}`
    }

    showReportCardEntries = (x: ReportCardEntryAtom) =>
        this.router.navigate(
            [`reportCards/labworks/${x.labwork.id}/students/${x.student.id}`],
            {relativeTo: this.route}
        )

    // calendarEvents = (reportCardEntries: ReportCardEntryAtom[]): () => ScheduleEntryEvent<ReportCardEntryAtom>[] => () => {
    //     const go = (e: ReportCardEntryAtom): ScheduleEntryEvent<ReportCardEntryAtom> => {
    //         const backgroundColor = colorForCourse(e.labwork.course)
    //         const foregroundColor = whiteColor()
    //
    //         return {
    //             allDay: false,
    //             start: Time.withNewDate(e.date, e.start).date,
    //             end: Time.withNewDate(e.date, e.end).date,
    //             title: this.eventTitle('month', e),
    //             borderColor: backgroundColor,
    //             backgroundColor: backgroundColor,
    //             textColor: foregroundColor,
    //             extendedProps: e
    //         }
    //     }
    //
    //     return reportCardEntries.map(go)
    // }
    //
    // eventTitle = (view: CalendarView, e: ReportCardEntryAtom) => {
    //     switch (view) {
    //         case 'month':
    //             return `${e.labwork.label} in ${e.room.label}`
    //         case 'list':
    //             const grp = foldUndefined(
    //                 this.dashboard.groups.find(_ => _.labwork.id === e.labwork.id),
    //                 g => ` Gruppe ${g.groupLabel}`,
    //                 () => ''
    //             )
    //             return `${e.labwork.label} in ${e.room.label}: ${e.label}${grp}`
    //     }
    // }
    //
    // eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<ReportCardEntryAtom>>) =>
    //     foldUndefined(e.extendedProps, p => this.eventTitle(view, p), () => e.title)
    //
    // onEventClick = (event: ScheduleEntryEvent<ReportCardEntryAtom>) => {
    //     if (!event.extendedProps) {
    //         return
    //     }
    //
    //     const labwork = event.extendedProps.labwork.id
    //     const student = event.extendedProps.student.id
    //
    //     this.router.navigate(
    //         [`reportCards/labworks/${labwork}/students/${student}`],
    //         {relativeTo: this.route}
    //     )
    // }
}
