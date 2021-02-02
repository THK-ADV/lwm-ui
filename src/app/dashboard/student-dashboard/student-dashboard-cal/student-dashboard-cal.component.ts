import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {CalendarView, ScheduleEntryEvent, scheduleEntryEventTitleLong} from '../../../labwork-chain/schedule/view/schedule-view-model'
import {colorForCourse} from '../../../utils/course-colors'
import {whiteColor} from '../../../utils/colors'
import {Time} from '../../../models/time.model'
import {foldUndefined} from '../../../utils/functions'
import {Semester} from '../../../models/semester.model'
import {ActivatedRoute, Router} from '@angular/router'
import {DashboardGroupLabel} from '../../../models/dashboard.model'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'
import {employeeDashboardScheduleEntryEvents} from '../../employee-dashboard/employee-dashboard.component'

type StudentDashboardCalEntry = ReportCardEntryAtom | ScheduleEntryAtom

@Component({
    selector: 'lwm-student-dashboard-cal',
    templateUrl: './student-dashboard-cal.component.html',
    styleUrls: ['./student-dashboard-cal.component.scss']
})
export class StudentDashboardCalComponent implements OnInit {

    @Input() reportCardEntries: ReportCardEntryAtom[]
    @Input() scheduleEntries: ScheduleEntryAtom[]
    @Input() semester: Semester
    @Input() groups: DashboardGroupLabel[]

    scheduleEntryEvents: ScheduleEntryEvent<StudentDashboardCalEntry>[]
    hasCalendarEntries: boolean

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.hasCalendarEntries = this.reportCardEntries.length > 0 || this.scheduleEntries.length > 0
        this.scheduleEntryEvents = this.makeCalendarEvents()
    }

    private makeCalendarEvents = (): ScheduleEntryEvent<StudentDashboardCalEntry>[] => {
        const go = (e: ReportCardEntryAtom): ScheduleEntryEvent<ReportCardEntryAtom> => {
            const backgroundColor = colorForCourse(e.labwork.course)
            const foregroundColor = whiteColor()


            const date = this.getDate(e)
            const start = this.getStart(e)
            const end = this.getEnd(e)

            return {
                allDay: false,
                start: Time.withNewDate(date, start).date,
                end: Time.withNewDate(date, end).date,
                title: this.eventTitle('month', e),
                borderColor: backgroundColor,
                backgroundColor: backgroundColor,
                textColor: foregroundColor,
                extendedProps: e
            }
        }

        return [
            ...this.reportCardEntries.map(go),
            ...employeeDashboardScheduleEntryEvents(this.scheduleEntries)
        ]
    }

    private getEnd = (e: ReportCardEntryAtom) =>
        e.rescheduled?.end ?? e.end

    private getStart = (e: ReportCardEntryAtom) =>
        e.rescheduled?.start ?? e.start

    private getDate = (e: ReportCardEntryAtom) =>
        e.rescheduled?.date ?? e.date

    private getRoom = (e: ReportCardEntryAtom) =>
        e.rescheduled?.room ?? e.room

    private eventTitle = (view: CalendarView, e: ReportCardEntryAtom) => {
        const room = this.getRoom(e)
        const labwork = e.labwork
        const grp = this.groups.find(_ => _.labworkId === labwork.id)
        const index = e.assignmentIndex + 1
        let base = ''

        switch (view) {
            case 'month':
                base = `#${index} ${labwork.label} in ${room.label}`
                return (grp && base + ` (Grp. ${grp.groupLabel})`) ?? base
            case 'list':
                base = `#${index} ${labwork.label} in ${room.label}: ${e.label}`
                return (grp && base + ` Gruppe ${grp.groupLabel}`) ?? base
        }
    }

    isReportCardEntryAtom = (e: StudentDashboardCalEntry): e is ReportCardEntryAtom =>
        (e as ReportCardEntryAtom).assignmentIndex !== undefined

    eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<StudentDashboardCalEntry>>) =>
        foldUndefined(
            e.extendedProps,
            p => this.isReportCardEntryAtom(p) ?
                this.eventTitle(view, p) :
                scheduleEntryEventTitleLong(view, p),
            () => e.title
        )

    onEventClick = (event: ScheduleEntryEvent<StudentDashboardCalEntry>) => {
        if (!event.extendedProps) {
            return
        }

        const routeUrl = (e: StudentDashboardCalEntry) => {
            if (this.isReportCardEntryAtom(e)) {
                return `reportCards/labworks/${(e.labwork.id)}/students/${(e.student.id)}`
            } else {
                return `courses/${(e.labwork.course.id)}/scheduleEntries/${(e.id)}`
            }
        }

        this.router.navigate(
            [routeUrl(event.extendedProps)],
            {relativeTo: this.route}
        )
    }
}
