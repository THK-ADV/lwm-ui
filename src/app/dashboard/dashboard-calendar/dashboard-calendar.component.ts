import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {
  CalendarView,
  ScheduleEntryEvent,
} from '../../labwork-chain/schedule/view/schedule-view-model'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { Semester } from '../../models/semester.model'
import { minBy } from '../../utils/functions'
import { CalendarOptions } from '@fullcalendar/core'

@Component({
  selector: 'lwm-dashboard-calendar',
  templateUrl: './dashboard-calendar.component.html',
  styleUrls: ['./dashboard-calendar.component.scss'],
  standalone: false,
})
export class DashboardCalendarComponent<A> implements OnInit {
  @Input() eventTitleFor: (
    view: CalendarView,
    e: Readonly<ScheduleEntryEvent<A>>,
  ) => string
  @Input() semester: Semester
  @Input() startAtToday: boolean
  @Output() eventClickEmitter = new EventEmitter<ScheduleEntryEvent<A>>()

  // erased generic type parameter to any due to compiler limitations
  @Input() set scheduleEntryEvents(xs: ScheduleEntryEvent<any>[]) {
    this.allDates = xs
    this.calendarOptions.events = this.allDates
    this.setStartDate()
  }

  allDates: ScheduleEntryEvent<any>[] = []
  startDate: Date

  @ViewChild('calendar') calendar: FullCalendarComponent

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, listPlugin],
    locale: 'de',
    editable: true,
    nowIndicator: false,
    weekends: false,
    firstDay: 1,
    headerToolbar: {
      left: 'month list today',
      center: 'title',
      right: 'prev next',
    },
    dayHeaderFormat: { weekday: 'long' },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: false,
    },
    weekNumbers: true,
  }

  ngOnInit(): void {
    this.calendarOptions.customButtons = {
      today: { text: 'Heute', click: this.goToToday },
      month: { text: 'Monat', click: this.showMonthView },
      list: { text: 'Liste', click: this.showListView },
    }
    this.calendarOptions.validRange = {
      start: this.semester.start,
      end: this.semester.end,
    }
    this.calendarOptions.initialDate = this.startDate
    this.calendarOptions.eventClick = (arg) => {
      const event = arg.event as ScheduleEntryEvent<any>
      this.eventClickEmitter.emit(event)
    }
  }

  goToToday = () => {
    this.calendar.getApi().gotoDate(new Date())
  }

  showMonthView = () => {
    this.updateTitle('month')
    this.calendar.getApi().changeView('dayGridMonth')
  }

  showListView = () => {
    this.updateTitle('list')
    this.calendar.getApi().changeView('listWeek')
  }

  private setStartDate = () => {
    if (this.startAtToday) {
      this.startDate = new Date()
    } else {
      const min = minBy(
        this.allDates,
        (lhs, rhs) => lhs.start.getTime() < rhs.start.getTime(),
      )?.start
      this.startDate = min ?? new Date()
    }
  }

  private updateTitle = (view: CalendarView) => {
    this.allDates = this.allDates.map((d) => ({
      ...d,
      title: this.eventTitleFor(view, d),
    }))
    this.calendarOptions.events = this.allDates
  }
}
