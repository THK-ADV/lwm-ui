import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core'
import {CalendarView, ScheduleEntryEvent} from '../../labwork-chain/schedule/view/schedule-view-model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {Semester} from '../../models/semester.model'
import {dateOrderingASC, first, foldUndefined} from '../../utils/functions'

@Component({
    selector: 'lwm-dashboard-calendar',
    templateUrl: './dashboard-calendar.component.html',
    styleUrls: ['./dashboard-calendar.component.scss']
})
export class DashboardCalendarComponent<A> implements OnInit {

    @Input() makeCalendarEvents: () => ScheduleEntryEvent<A>[]
    @Input() eventTitleFor: (view: CalendarView, e: Readonly<ScheduleEntryEvent<A>>) => string
    @Input() semester: Semester

    @Output() eventClickEmitter = new EventEmitter<ScheduleEntryEvent<A>>()

    readonly calendarPlugins = [dayGridPlugin, listPlugin]

    allDates: ScheduleEntryEvent<A>[] = []

    @ViewChild('calendar') calendar: FullCalendarComponent

    constructor() {
    }

    ngOnInit(): void {
        this.allDates = this.makeCalendarEvents()
    }

    semesterBoundaries = () => ({
        start: this.semester.start,
        end: this.semester.end
    })

    goToToday = () =>
        this.calendar.getApi().gotoDate(new Date())

    earliestDate = () =>
        foldUndefined(
            first(this.allDates.sort((lhs, rhs) => dateOrderingASC(lhs.start, rhs.start))),
            min => min.start,
            () => new Date()
        )

    showMonthView = () => {
        this.allDates = this.changeTitle('month')
        this.calendar.getApi().changeView('dayGridMonth')
    }

    showListView = () => {
        this.allDates = this.changeTitle('list')
        this.calendar.getApi().changeView('listWeek')
    }

    onEventClick = (event: ScheduleEntryEvent<A>) => {
        this.eventClickEmitter.emit(event)
    }

    private changeTitle = (view: CalendarView) =>
        this.allDates.map(d => ({...d, title: this.eventTitleFor(view, d)}))
}
