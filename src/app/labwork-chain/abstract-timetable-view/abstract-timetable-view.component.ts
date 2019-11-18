import {Component, Input, OnInit} from '@angular/core'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {CalendarEvent, isValidTimetableEntry, makeCalendarEvents} from '../timetable/timetable-view-model'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {color} from '../../utils/colors'
import {calculateWorkload, SupervisorWorkload} from './abstract-timetable-view-model'

@Component({
    selector: 'lwm-abstract-timetable-view',
    templateUrl: './abstract-timetable-view.component.html',
    styleUrls: ['./abstract-timetable-view.component.scss'],
    providers: LWMDateAdapter.defaultProviders()
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
        this.dates = makeCalendarEvents(t)
        this.workloads = calculateWorkload(t.entries)
            .sort((lhs, rhs) => lhs.workload - rhs.workload)
    }

    private readonly calendarPlugins = [timeGridPlugin, interactionPlugin]
    private dates: CalendarEvent[]
    private headerTitle: string
    private readonly formGroup: FormGroup
    private workloads: SupervisorWorkload[]

    constructor() {
        this.dates = []
        this.workloads = []
        this.formGroup = new FormGroup({
            start: new FormControl({value: ''}, Validators.required)
        })
    }

    ngOnInit() {
        console.log('timetable component loaded')

        if (this.canEdit) {
            this.startDateControl().enable()
        } else {
            this.startDateControl().disable()
        }

        this.headerTitle = `${this.canEdit ? 'Rahmenplanbearbeitung' : 'Rahmenplan'} für ${this.labwork.label}`
    }

    startDateControl = () => this.formGroup.controls.start

    private onDateSelection = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.selectDate(event)
        }
    }

    private onEventClick = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.clickEvent(event)
        }
    }

    private onEventDrop = (event: CalendarEvent) => {
        if (this.canEdit) {
            this.dropEvent(event)
        }
    }

    private onEventResize = (eventResizeInfo) => {
        if (!this.canEdit || !this.isValidRange(eventResizeInfo.event)) {
            eventResizeInfo.revert()
            return
        }

        this.resizeEvent(eventResizeInfo.event)
    }

    private allowSelect = (event: CalendarEvent): boolean => {
        return this.canEdit && this.isValidRange(event)
    }

    private isValidRange = (event: CalendarEvent) => isValidTimetableEntry(event.start, event.end)

    private primaryColor = () => color('primary')

    private displayWorkload = ({user, workload}: SupervisorWorkload) => {
        return `${user.lastname}, ${user.firstname} (${workload}h)`
    }
}
