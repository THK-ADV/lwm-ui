import {Component, Input, OnInit, ViewChild} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {
    eventEntriesForList,
    eventEntriesForMonth,
    makeBlacklistEvents,
    makeScheduleEntryEvents,
    ScheduleEntryEvent
} from './schedule-view-model'
import {TimetableAtom} from '../../models/timetable'
import {FullCalendarComponent} from '@fullcalendar/angular'

@Component({
    selector: 'lwm-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>
    @Input() timetable: Readonly<TimetableAtom>

    private readonly calendarPlugins = [dayGridPlugin, listPlugin]
    private dates: ScheduleEntryEvent[]
    private headerTitle: string

    @ViewChild('calendar', {static: false}) calendar: FullCalendarComponent

    constructor() {
    }

    ngOnInit() {
        console.log('schedule component loaded')

        this.headerTitle = `Staffelplan für ${this.labwork.label}`
        this.updateCalendar(this.scheduleEntries)
    }

    private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryAtom[]>) => {
        console.log('updating schedule cal')

        this.scheduleEntries = scheduleEntries
        this.dates = makeScheduleEntryEvents(this.scheduleEntries).concat(makeBlacklistEvents(this.timetable.localBlacklist))
    }

    private canPreview = () => {
        return true // TODO permission check
    }

    private onPreview = () => {
        // TODO
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
        this.dates = eventEntriesForMonth(this.dates)
        this.calendar.getApi().changeView('dayGridMonth')
    }

    private showListView = () => {
        this.dates = eventEntriesForList(this.dates)
        this.calendar.getApi().changeView('listWeek')
    }
}
