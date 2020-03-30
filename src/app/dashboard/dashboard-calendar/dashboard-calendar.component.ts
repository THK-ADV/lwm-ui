import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core'
import {CalendarView, eventTitle, ScheduleEntryEvent, scheduleEntryProps} from '../../labwork-chain/schedule/view/schedule-view-model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {Semester} from '../../models/semester.model'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {dateOrderingASC, first, foldUndefined} from '../../utils/functions'

@Component({
    selector: 'lwm-dashboard-calendar',
    templateUrl: './dashboard-calendar.component.html',
    styleUrls: ['./dashboard-calendar.component.scss']
})
export class DashboardCalendarComponent implements OnInit {

    @Input() makeCalendarEvents: () => ScheduleEntryEvent<ScheduleEntryAtom>[]
    @Input() semester: Semester

    @Output() eventClickEmitter = new EventEmitter<ScheduleEntryEvent<ScheduleEntryAtom>>()

    readonly calendarPlugins = [dayGridPlugin, listPlugin]

    allDates: ScheduleEntryEvent<ScheduleEntryAtom>[] = []

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

    onEventClick = (event: ScheduleEntryEvent<ScheduleEntryAtom>) => {
        this.eventClickEmitter.emit(event)
    }

    private changeTitle = (view: CalendarView) =>
        this.allDates.map(d => {
            const copy = {...d}

            if (copy.extendedProps) {
                copy.title = eventTitle(
                    view,
                    scheduleEntryProps(copy.extendedProps.supervisor, copy.extendedProps.room, copy.extendedProps.group)
                )
            }

            return copy
        })
}
