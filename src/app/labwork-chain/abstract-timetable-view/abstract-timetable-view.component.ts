import { Component, Input, OnInit } from '@angular/core'
import { LWMDateAdapter } from '../../utils/lwmdate-adapter'
import { LabworkAtom } from '../../models/labwork.model'
import { TimetableAtom } from '../../models/timetable'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  CalendarEvent,
  isValidTimetableEntry,
  makeCalendarEvents,
} from '../timetable/timetable-view-model'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { color } from '../../utils/colors'
import {
  calculateWorkload,
  SupervisorWorkload,
} from './abstract-timetable-view-model'
import {
  CalendarOptions,
  DateSelectArg,
  EventDropArg,
} from '@fullcalendar/core'
import { EventImpl } from '@fullcalendar/core/internal'

@Component({
  selector: 'lwm-abstract-timetable-view',
  templateUrl: './abstract-timetable-view.component.html',
  styleUrls: ['./abstract-timetable-view.component.scss'],
  providers: LWMDateAdapter.defaultProviders(),
  standalone: false,
})
export class AbstractTimetableViewComponent implements OnInit {
  // TODO draw timetable entries from labworks which take place in the same semester

  @Input() labwork: Readonly<LabworkAtom>
  @Input() canEdit: boolean

  @Input() selectDate: (start: Date, end: Date) => void
  @Input() clickEvent: (event: CalendarEvent) => void
  @Input() dropEvent: (event: CalendarEvent) => void
  @Input() resizeEvent: (event: CalendarEvent) => void
  @Input() copyEvent: (event: CalendarEvent) => void

  @Input() set timetable(t: Readonly<TimetableAtom>) {
    this.formGroup.controls.start.setValue(t.start, { emitEvent: false })
    this.calendarOptions.events = makeCalendarEvents(t)
    this.workloads = calculateWorkload(t.entries).sort(
      (lhs, rhs) => lhs.workload - rhs.workload,
    )
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [timeGridPlugin, interactionPlugin],
    locale: 'de',
    weekends: false,
    nowIndicator: false,
    allDaySlot: false,
    dayHeaderFormat: { weekday: 'long' },
    slotDuration: '00:15:00',
    slotLabelInterval: { hours: 1 },
    slotEventOverlap: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    headerToolbar: false,
    selectable: true,
    selectMirror: true,
    selectMinDistance: 10,
    eventColor: color('primary'),
    eventTextColor: '#ffffff',
    unselectCancel: '.unselectable',
  }

  headerTitle: string
  readonly formGroup: FormGroup
  workloads: SupervisorWorkload[]

  constructor() {
    this.workloads = []
    this.formGroup = new FormGroup({
      start: new FormControl(
        { value: '', disabled: false },
        Validators.required,
      ),
    })
  }

  ngOnInit() {
    this.headerTitle = `${this.canEdit ? 'Rahmenplanbearbeitung' : 'Rahmenplan'} für ${this.labwork.label}`
    this.calendarOptions.editable = this.canEdit
    if (this.canEdit) {
      this.startDateControl().enable()
      this.calendarOptions.selectAllow = (date, _) => {
        return isValidTimetableEntry(date.start, date.end)
      }
      this.calendarOptions.select = (arg: DateSelectArg) => {
        this.selectDate(arg.start, arg.end)
      }
      this.calendarOptions.eventClick = (arg) => {
        this.clickEvent(this.toCalenderEvent(arg.event))
      }
      this.calendarOptions.eventDrop = (arg: EventDropArg) => {
        if (arg.jsEvent.altKey) {
          this.copyEvent(this.toCalenderEvent(arg.event))
          arg.revert
        } else {
          this.dropEvent(this.toCalenderEvent(arg.event))
        }
      }
      this.calendarOptions.eventResize = (arg) => {
        const start = arg.event.start
        const end = arg.event.end

        if (!(start && end)) {
          return
        }

        if (!isValidTimetableEntry(start, end)) {
          arg.revert()
          return
        }

        this.resizeEvent(this.toCalenderEvent(arg.event))
      }
    } else {
      this.startDateControl().disable()
    }
  }

  startDateControl = () => this.formGroup.controls.start

  toCalenderEvent = (e: EventImpl): CalendarEvent => {
    const event: CalendarEvent = JSON.parse(JSON.stringify(e))
    event.start = new Date(event.start)
    event.end = new Date(event.end)
    return event
  }

  displayWorkload = ({ user, workload }: SupervisorWorkload) => {
    return `${user.lastname}, ${user.firstname} (${workload}h)`
  }
}
