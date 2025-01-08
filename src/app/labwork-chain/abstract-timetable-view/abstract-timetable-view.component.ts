import {Component, Input, OnInit} from '@angular/core'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, {EventResizeDoneArg} from '@fullcalendar/interaction'
import {CalendarEvent, isValidTimetableEntry, makeCalendarEvents} from '../timetable/timetable-view-model'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {color} from '../../utils/colors'
import {calculateWorkload, SupervisorWorkload} from './abstract-timetable-view-model'
import {CalendarOptions} from '@fullcalendar/core'

@Component({
    selector: 'lwm-abstract-timetable-view',
    templateUrl: './abstract-timetable-view.component.html',
    styleUrls: ['./abstract-timetable-view.component.scss'],
    providers: LWMDateAdapter.defaultProviders(),
    standalone: false
})
export class AbstractTimetableViewComponent implements OnInit {
    // TODO draw timetable entries from labworks which take place in the same semester

    @Input() labwork: Readonly<LabworkAtom>
    @Input() canEdit: boolean

    @Input() selectDate: (event: CalendarEvent) => void
    @Input() clickEvent: (event: CalendarEvent) => void
    @Input() dropEvent: (event: CalendarEvent) => void
    @Input() resizeEvent: (event: CalendarEvent) => void

    @Input() set timetable(t: Readonly<TimetableAtom>) {
        this.formGroup.controls.start.setValue(t.start, {emitEvent: false})
        this.calendarOptions.events = makeCalendarEvents(t)
        this.workloads = calculateWorkload(t.entries)
            .sort((lhs, rhs) => lhs.workload - rhs.workload)
    }

    calendarOptions: CalendarOptions = {
        initialView: 'timeGridWeek',
        plugins: [timeGridPlugin, interactionPlugin],
        locale: 'de',
        weekends: false,
        nowIndicator: false,
        allDaySlot: false,
        dayHeaderFormat: { weekday: 'long' },
        slotDuration:'00:15:00',
        slotLabelInterval:  {hours:1},
        slotEventOverlap: false,
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        headerToolbar: false,
        selectable: true,
        selectMirror: true,
        selectMinDistance: 10,
        eventColor: color('primary'),
        eventTextColor: '#ffffff',
        unselectCancel: '.unselectable'
    }

    headerTitle: string
    readonly formGroup: FormGroup
    workloads: SupervisorWorkload[]

    constructor() {
        this.workloads = []
        this.formGroup = new FormGroup({
            start: new FormControl({value: '', disabled: false}, Validators.required)
        })
    }

    ngOnInit() {
        if (this.canEdit) {
            this.startDateControl().enable()
        } else {
            this.startDateControl().disable()
        }

        // TODO: TEST THIS COMPONENT
        this.headerTitle = `${this.canEdit ? 'Rahmenplanbearbeitung' : 'Rahmenplan'} für ${this.labwork.label}`
        this.calendarOptions.editable = this.canEdit
        this.calendarOptions.selectAllow = (date, _) => {
            console.log('selectAllow', date)
            return this.canEdit && isValidTimetableEntry(date.start, date.end)
        }
        this.calendarOptions.select = (a) => {
            console.log('select', a)
            // this.onDateSelection(a)
        }
        this.calendarOptions.eventClick = (a) => {
            console.log('eventClick', a.event)
            // this.onEventClick(a.event)
        }
        this.calendarOptions.eventDrop = (a) => {
            console.log('eventDrop', a.event)
            // this.onEventDrop(a.event)
        }
        this.calendarOptions.eventResize = this.onEventResize
    }

    startDateControl = () => this.formGroup.controls.start

    onDateSelection = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.selectDate(event)
        }
    }

    onEventClick = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.clickEvent(event)
        }
    }

    onEventDrop = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.dropEvent(event)
        }
    }

    onEventResize = (eventResizeInfo: EventResizeDoneArg) => {
        console.log('eventResize', eventResizeInfo.event)
        const start = eventResizeInfo.event.start
        const end = eventResizeInfo.event.end

        if (!(start && end)) {
            return
        }

        if (!this.canEdit || !isValidTimetableEntry(start, end)) {
            eventResizeInfo.revert()
            return
        }
        // this.resizeEvent(eventResizeInfo.event)
    }

    displayWorkload = ({user, workload}: SupervisorWorkload) => {
        return `${user.lastname}, ${user.firstname} (${workload}h)`
    }
}
