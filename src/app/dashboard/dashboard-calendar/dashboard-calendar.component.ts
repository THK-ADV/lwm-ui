import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core'
import {CalendarView, ScheduleEntryEvent} from '../../labwork-chain/schedule/view/schedule-view-model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {Semester} from '../../models/semester.model'
import {minBy} from '../../utils/functions'
import {CalendarOptions} from '@fullcalendar/core'

@Component({
    selector: 'lwm-dashboard-calendar',
    templateUrl: './dashboard-calendar.component.html',
    styleUrls: ['./dashboard-calendar.component.scss'],
    standalone: false
})
export class DashboardCalendarComponent<A> implements OnInit {

    @Input() eventTitleFor: (view: CalendarView, e: Readonly<ScheduleEntryEvent<A>>) => string
    @Input() semester: Semester
    @Input() startAtToday: boolean

    @Input() set scheduleEntryEvents(xs: ScheduleEntryEvent<A>[]) {
        this.allDates = xs
        this.setStartDate()
    }

    @Output() eventClickEmitter = new EventEmitter<ScheduleEntryEvent<A>>()

    // TODO: erased generic type parameter to any
    set allDates(xs: ScheduleEntryEvent<any>[]) {
        this.calendarOptions.events = xs
    }

    startDate: Date

    @ViewChild('calendar') calendar: FullCalendarComponent

    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins:[dayGridPlugin, listPlugin],
        locale: 'de',
        editable: true,
        nowIndicator: false,
        weekends: false,
        firstDay: 1,
        allDaySlot: true,
        headerToolbar: {left: 'month, list, today', center: 'title', right: 'prev,next'},
        buttonText: {month: 'Monat', list: 'Liste'},
        dayHeaderFormat: { weekday: 'long' },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false },
        weekNumbers: true,

    }


    ngOnInit(): void {
        // TODO: TEST THIS COMPONENT
        // (eventClick)="onEventClick($event.event)">
        this.calendarOptions.customButtons = {
            today: {text: 'Heute', click: this.goToToday},
            month: {text: 'Monat', click: this.showMonthView},
            list: {text: 'Liste', click: this.showListView}
        }
        this.calendarOptions.validRange = {start: this.semester.start, end: this.semester.end}
        this.calendarOptions.initialDate = this.startDate
        this.calendarOptions.eventClick = (a) => {
            console.log('eventClick', a.event)
            // this.onEventClick(a.event)
        }
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

    private setStartDate = () => {
        if (this.startAtToday) {
            this.startDate = new Date()
        } else {
            const min = minBy(this.allDates, (lhs, rhs) => lhs.start.getTime() < rhs.start.getTime())?.start
            this.startDate = min ?? new Date()
        }
    }

    private changeTitle = (view: CalendarView) =>
        this.allDates.map(d => ({...d, title: this.eventTitleFor(view, d)}))
}
