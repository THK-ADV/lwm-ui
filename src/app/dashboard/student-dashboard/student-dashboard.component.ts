import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {LabworkApplicationAtom} from 'src/app/models/labwork.application.model'
import {foldUndefined, subscribe} from '../../utils/functions'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {CalendarView, ScheduleEntryEvent} from '../../labwork-chain/schedule/view/schedule-view-model'
import {colorForCourse} from '../../utils/course-colors'
import {whiteColor} from '../../utils/colors'
import {Time} from '../../models/time.model'
import {ActivatedRoute, Router} from '@angular/router'

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

    calendarEvents = (reportCardEntries: ReportCardEntryAtom[]): () => ScheduleEntryEvent<ReportCardEntryAtom>[] => () => {
        const go = (e: ReportCardEntryAtom): ScheduleEntryEvent<ReportCardEntryAtom> => {
            const backgroundColor = colorForCourse(e.labwork.course)
            const foregroundColor = whiteColor()

            return {
                allDay: false,
                start: Time.withNewDate(e.date, e.start).date,
                end: Time.withNewDate(e.date, e.end).date,
                title: this.eventTitle('month', e),
                borderColor: backgroundColor,
                backgroundColor: backgroundColor,
                textColor: foregroundColor,
                extendedProps: e
            }
        }

        return reportCardEntries.map(go)
    }

    eventTitle = (view: CalendarView, e: ReportCardEntryAtom) => {
        switch (view) {
            case 'month':
                return `${e.labwork.label} in ${e.room.label}`
            case 'list':
                const grp = foldUndefined(
                    this.dashboard.groups.find(_ => _.labwork.id === e.labwork.id),
                    g => ` Gruppe ${g.groupLabel}`,
                    () => ''
                )
                return `${e.labwork.label} in ${e.room.label}: ${e.label}${grp}`
        }
    }

    eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<ReportCardEntryAtom>>) =>
        foldUndefined(e.extendedProps, p => this.eventTitle(view, p), () => e.title)

    onEventClick = (event: ScheduleEntryEvent<ReportCardEntryAtom>) => {
        if (!event.extendedProps) {
            return
        }

        const labwork = event.extendedProps.labwork.id
        const student = event.extendedProps.student.id

        this.router.navigate(
            [`reportCards/labworks/${labwork}/students/${student}`],
            {relativeTo: this.route}
        )
    }
}
