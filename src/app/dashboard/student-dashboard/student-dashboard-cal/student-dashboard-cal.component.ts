import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {CalendarView, ScheduleEntryEvent} from '../../../labwork-chain/schedule/view/schedule-view-model'
import {colorForCourse} from '../../../utils/course-colors'
import {whiteColor} from '../../../utils/colors'
import {Time} from '../../../models/time.model'
import {foldUndefined} from '../../../utils/functions'
import {Semester} from '../../../models/semester.model'
import {LabworkAtom} from '../../../models/labwork.model'
import {ActivatedRoute, Router} from '@angular/router'

@Component({
    selector: 'lwm-student-dashboard-cal',
    templateUrl: './student-dashboard-cal.component.html',
    styleUrls: ['./student-dashboard-cal.component.scss']
})
export class StudentDashboardCalComponent implements OnInit {

    @Input() reportCardEntries: ReportCardEntryAtom[]
    @Input() semester: Semester
    @Input() groups: { groupLabel: string, labwork: LabworkAtom }[]

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
    }

    hasCalendarEntries = () =>
        this.reportCardEntries.length > 0

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
                    this.groups.find(_ => _.labwork.id === e.labwork.id),
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
