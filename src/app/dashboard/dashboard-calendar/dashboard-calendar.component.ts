import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core'
import {CalendarView, ScheduleEntryEvent} from '../../labwork-chain/schedule/view/schedule-view-model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {Semester} from '../../models/semester.model'
import {minBy} from '../../utils/functions'

@Component({
    selector: 'lwm-dashboard-calendar',
    templateUrl: './dashboard-calendar.component.html',
    styleUrls: ['./dashboard-calendar.component.scss']
})
export class DashboardCalendarComponent<A> implements OnInit {

    @Input() eventTitleFor: (view: CalendarView, e: Readonly<ScheduleEntryEvent<A>>) => string
    @Input() semester: Semester

    @Input() set scheduleEntryEvents(xs: ScheduleEntryEvent<A>[]) {
        this.allDates = xs
        this.setStartDate()
    }

    @Output() eventClickEmitter = new EventEmitter<ScheduleEntryEvent<A>>()

    readonly calendarPlugins = [dayGridPlugin, listPlugin]

    allDates: ScheduleEntryEvent<A>[] = []
    startDate: Date
    semesterBoundaries: { start: Date, end: Date }

    @ViewChild('calendar') calendar: FullCalendarComponent

    constructor() {
    }

    ngOnInit(): void {
        this.setSemesterBoundaries()
    }

    goToToday = () => {
        this.calendar.getApi().gotoDate(new Date())
    }

    showMonthView = () => {
        this.allDates = this.changeTitle('month')
        this.calendar.getApi().changeView('dayGridMonth')
    }

    showListView = () => {
        this.allDates = this.changeTitle('list')
        this.calendar.getApi().changeView('listWeek')
    }

    onEventClick = (event: ScheduleEntryEvent<A>) =>
        this.eventClickEmitter.emit(event)

    private setSemesterBoundaries = () => {
        this.semesterBoundaries = {start: this.semester.start, end: this.semester.end}
    }

    private setStartDate = () => {
        const min = minBy(this.allDates, (lhs, rhs) => lhs.start.getTime() < rhs.start.getTime())?.start
        this.startDate = min ?? new Date()
    }

    private changeTitle = (view: CalendarView) =>
        this.allDates.map(d => ({...d, title: this.eventTitleFor(view, d)}))
}
