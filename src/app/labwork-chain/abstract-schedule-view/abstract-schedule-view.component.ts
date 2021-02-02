import {Component, Input, OnInit, ViewChild} from '@angular/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {CalendarView, scheduleEntryEventTitleShort, makeBlacklistEvents, ScheduleEntryEvent, ScheduleEntryProps} from '../schedule/view/schedule-view-model'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'

@Component({
    selector: 'lwm-abstract-schedule-view',
    templateUrl: './abstract-schedule-view.component.html',
    styleUrls: ['./abstract-schedule-view.component.scss']
})
export class AbstractScheduleViewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>

    readonly calendarPlugins = [dayGridPlugin, listPlugin]

    allDates: ScheduleEntryEvent<ScheduleEntryProps>[]
    semesterBoundaries: { start: Date, end: Date }
    startDate: Date

    @ViewChild('calendar') calendar: FullCalendarComponent

    @Input() set dates(dates: ScheduleEntryEvent<ScheduleEntryProps>[]) {
        this.allDates = dates.concat(makeBlacklistEvents(this.timetable.localBlacklist))
        this.setSemesterBoundaries()
    }

    constructor() {
        this.allDates = []
    }

    ngOnInit() {
        this.startDate = this.timetable.start
    }

    showLabworkStartDate = () =>
        this.calendar.getApi().gotoDate(this.timetable.start)

    showMonthView = () => {
        this.allDates = this.changedTitleFor('month')
        this.calendar.getApi().changeView('dayGridMonth')
    }

    showListView = () => {
        this.allDates = this.changedTitleFor('list')
        this.calendar.getApi().changeView('listWeek')
    }

    private setSemesterBoundaries = () => {
        this.semesterBoundaries = {start: this.labwork.semester.start, end: this.labwork.semester.end}
    }

    private changedTitleFor = (view: CalendarView) =>
        this.allDates.map(d => {
            const copy = {...d}

            if (copy.extendedProps) {
                copy.title = scheduleEntryEventTitleShort(view, copy.extendedProps)
            }

            return copy
        })
}
