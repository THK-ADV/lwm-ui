import {Component, Input, OnInit, ViewChild} from '@angular/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {CalendarView, scheduleEntryEventTitleShort, makeBlacklistEvents, ScheduleEntryEvent, ScheduleEntryProps} from '../schedule/view/schedule-view-model'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'
import {CalendarOptions} from '@fullcalendar/core'

@Component({
    selector: 'lwm-abstract-schedule-view',
    templateUrl: './abstract-schedule-view.component.html',
    styleUrls: ['./abstract-schedule-view.component.scss'],
    standalone: false
})
export class AbstractScheduleViewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
    @Input() set dates(dates: ScheduleEntryEvent<ScheduleEntryProps>[]) {
        this.allDates = dates.concat(makeBlacklistEvents(this.timetable.localBlacklist))
    }

    @ViewChild('calendar') calendar: FullCalendarComponent

    set allDates(dates: ScheduleEntryEvent<ScheduleEntryProps>[]) {
        this.calendarOptions.events = dates
    }

    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin, listPlugin],
        locale: 'de',
        nowIndicator: true,
        weekends: false,
        firstDay: 1,
        allDaySlot: true,
        headerToolbar: {left: 'month, list, labworkStart', center: 'title', right: 'prev,next'},
        buttonText:{month: 'Monat', list: 'Liste'},
        dayHeaderFormat: { weekday: 'long' },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false },
        weekNumbers: true,
    }

    ngOnInit() {
        // TODO: TEST THIS COMPONENT
        this.calendarOptions.customButtons = {
            labworkStart: {text: 'Praktikumsbeginn', click: this.showLabworkStartDate},
            month: {text: 'Monat', click: this.showMonthView},
            list: {text: 'Liste', click: this.showListView}
        }
        this.calendarOptions.validRange = {start: this.labwork.semester.start, end: this.labwork.semester.end}
        this.calendarOptions.initialDate = this.timetable.start
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

    private changedTitleFor = (view: CalendarView) =>
        this.allDates.map(d => {
            const copy = {...d}

            if (copy.extendedProps) {
                copy.title = scheduleEntryEventTitleShort(view, copy.extendedProps)
            }

            return copy
        })
}
