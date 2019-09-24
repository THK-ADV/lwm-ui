import {Component, Input, ViewChild} from '@angular/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {eventEntriesForList, eventEntriesForMonth, makeBlacklistEvents, ScheduleEntryEvent} from '../schedule/view/schedule-view-model'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'

@Component({
    selector: 'lwm-abstract-schedule-view',
    templateUrl: './abstract-schedule-view.component.html',
    styleUrls: ['./abstract-schedule-view.component.scss']
})
export class AbstractScheduleViewComponent {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>

    private allDates: ScheduleEntryEvent[]
    private readonly calendarPlugins = [dayGridPlugin, listPlugin]

    @ViewChild('calendar', {static: false}) calendar: FullCalendarComponent

    @Input() set dates(dates: ScheduleEntryEvent[]) {
        this.allDates = dates.concat(makeBlacklistEvents(this.timetable.localBlacklist))
    }

    constructor() {
        this.allDates = []
    }

    private earliestDate = () => this.timetable.start

    private semesterBoundaries = () => ({
        start: this.labwork.semester.start,
        end: this.labwork.semester.end
    })

    private showLabworkStartDate = () => {
        this.calendar.getApi().gotoDate(this.timetable.start)
    }

    private showMonthView = () => {
        this.allDates = eventEntriesForMonth(this.allDates)
        this.calendar.getApi().changeView('dayGridMonth')
    }

    private showListView = () => {
        this.allDates = eventEntriesForList(this.allDates)
        this.calendar.getApi().changeView('listWeek')
    }
}