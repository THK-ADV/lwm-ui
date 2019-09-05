import {Component, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {MatDialog} from '@angular/material'
import {TimetableService} from '../../services/timetable.service'
import {subscribe} from '../../utils/functions'
import {Observable, Subscription} from 'rxjs'
import {TimetableAtom} from '../../models/timetable'
import {TimetableEntryComponent} from './timetable-entry/timetable-entry.component'
import {AuthorityService} from '../../services/authority.service'
import {map} from 'rxjs/operators'
import {openDialog} from '../../utils/component.utils'
import {RoomService} from '../../services/room.service'
import {
    CalendarEvent,
    fetchTimetable,
    makeCalendarEvents,
    updateSupervisorAndRoom,
    updateTime,
    updateTimetableEntry$
} from './timetable-view-model'

@Component({
    selector: 'lwm-timetable',
    templateUrl: './timetable.component.html',
    styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent implements OnInit {

    @Input() labwork: LabworkAtom

    private readonly calendarPlugins = [timeGridPlugin, interactionPlugin]
    private dates: CalendarEvent[]
    private headerTitle: string
    private subs: Subscription[]
    private timetable: TimetableAtom

    constructor(
        private readonly dialog: MatDialog,
        private readonly timetableService: TimetableService,
        private readonly authorityService: AuthorityService,
        private readonly roomService: RoomService
    ) {
        this.dates = []
        this.subs = []
    }

    ngOnInit() {
        this.headerTitle = `Rahmenplan für ${this.labwork.label}`
        this.subs.push(fetchTimetable(this.timetableService, this.labwork, this.updateCalendar))
    }

    private updateCalendar = (t: TimetableAtom) => {
        this.timetable = t
        this.dates = makeCalendarEvents(t)
    }

    private onDateSelection = (event) => {
        // this.dates = this.dates.concat(
        //     {title: 'new event', start: event.start, end: event.end, editable: true}
        // )
    }

    private onEventClick = (event: CalendarEvent) => {
        const dialogRef = TimetableEntryComponent.instance(
            this.dialog,
            event.extendedProps.room,
            this.roomService.getAll(),
            this.timetable.entries[event.id].supervisor,
            this.authorityService.getAuthoritiesForCourse(this.labwork.course.id).pipe(
                map(xs => xs.map(x => x.user))
            )
        )

        this.run(openDialog(
            dialogRef,
            tuple => updateTimetableEntry$(
                this.timetableService,
                this.timetable,
                event.id,
                updateSupervisorAndRoom(tuple)
            )
        ))
    }

    private run = (o: Observable<TimetableAtom>) => {
        this.subs.push(subscribe(o, this.updateCalendar))
    }

    private allowSelect = (event): boolean => {
        return event.end.getDay() === event.start.getDay()
    }

    private onEventDrop = (eventDropInfo) => {
        this.run(updateTimetableEntry$(
            this.timetableService,
            this.timetable,
            eventDropInfo.event.id,
            updateTime(eventDropInfo.event.start, eventDropInfo.event.end)
        ))
    }

    private onEventResize = (eventResizeInfo) => {
        console.log('onEventResize')
        console.log(eventResizeInfo)
    }


}
