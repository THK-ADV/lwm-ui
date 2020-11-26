import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {
    CalendarView,
    ScheduleEntryEvent,
    scheduleEntryEventTitle,
    scheduleEntryProps
} from '../../../labwork-chain/schedule/view/schedule-view-model'
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

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
    }

    hasCalendarEntries = () =>
        this.reportCardEntries.length > 0 || this.scheduleEntries.length > 0

    calendarEvents = (): ScheduleEntryEvent<StudentDashboardCalEntry>[] => {
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

        return [
            ...this.reportCardEntries.map(go),
            ...employeeDashboardScheduleEntryEvents(this.scheduleEntries)()
        ]
    }

    eventTitle = (view: CalendarView, e: ReportCardEntryAtom) => {
        switch (view) {
            case 'month':
                return `${e.labwork.label} in ${e.room.label}`
            case 'list':
                const grp = foldUndefined(
                    this.groups.find(_ => _.labworkId === e.labwork.id),
                    g => ` Gruppe ${g.groupLabel}`,
                    () => ''
                )
                return `${e.labwork.label} in ${e.room.label}: ${e.label}${grp}`
        }
    }

    isReportCardEntryAtom = (e: StudentDashboardCalEntry): e is ReportCardEntryAtom =>
        (e as ReportCardEntryAtom).assignmentIndex !== undefined

    eventTitleFor = (view: CalendarView, e: Readonly<ScheduleEntryEvent<StudentDashboardCalEntry>>) =>
        foldUndefined(e.extendedProps, p => {
            if (this.isReportCardEntryAtom(p)) {
                return this.eventTitle(view, p)
            } else {
                return scheduleEntryEventTitle(view, scheduleEntryProps(p.supervisor, p.room, p.group))
            }

        }, () => e.title)

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
