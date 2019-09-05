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
import {filter, map, switchMap} from 'rxjs/operators'
import {openDialog} from '../../utils/component.utils'
import {RoomService} from '../../services/room.service'
import {
    CalendarEvent,
    createTimetableEntry$,
    fetchTimetable,
    isValidTimetableEntry,
    makeCalendarEvents,
    updateStartDate,
    updateSupervisorAndRoom,
    updateTime,
    updateTimetable$,
    updateTimetableEntry$
} from './timetable-view-model'
import {User} from '../../models/user.model'
import {Room} from '../../models/room.model'
import {DialogMode} from '../../shared-dialogs/dialog.mode'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {isDate} from '../../utils/type.check.utils'

@Component({
    selector: 'lwm-timetable',
    templateUrl: './timetable.component.html',
    styleUrls: ['./timetable.component.scss'],
    providers: LWMDateAdapter.defaultProviders()
})
export class TimetableComponent implements OnInit { // TODO draw timetable entries from labworks which take place in the same semester

    // TODO this entire implementation assumes that a timetable exists. handle first creation

    @Input() labwork: LabworkAtom

    private readonly calendarPlugins = [timeGridPlugin, interactionPlugin]
    private dates: CalendarEvent[]
    private headerTitle: string
    private subs: Subscription[]
    private timetable: TimetableAtom
    private formGroup: FormGroup

    constructor(
        private readonly dialog: MatDialog,
        private readonly timetableService: TimetableService,
        private readonly authorityService: AuthorityService,
        private readonly roomService: RoomService
    ) {
        this.dates = []
        this.subs = []
        this.formGroup = new FormGroup({
            start: new FormControl({value: '', disabled: false}, Validators.required)
        })
    }

    ngOnInit() {
        this.headerTitle = `Rahmenplan für ${this.labwork.label}`
        this.subs.push(fetchTimetable(this.timetableService, this.labwork, this.updateCalendar))

        this.observeStartDateChanges()
    }

    private observeStartDateChanges = () => {
        this.run(this.formGroup.controls.start.valueChanges.pipe(
            filter(isDate),
            switchMap(d => updateTimetable$(this.timetableService, this.timetable, updateStartDate(d)))
        ))
    }

    private updateCalendar = (t: TimetableAtom) => {
        console.log('updating cal')
        this.timetable = t
        this.formGroup.controls.start.setValue(t.start, {emitEvent: false})
        this.dates = makeCalendarEvents(t)
    }

    private onDateSelection = (event) => {
        const dialogRef = this.timetableEntryDialog(DialogMode.create, [])

        this.run(openDialog(
            dialogRef,
            tuple => createTimetableEntry$(
                this.timetableService,
                this.timetable,
                tuple.first,
                tuple.second,
                event.start,
                event.end,
            )
        ))
    }

    private onEventClick = (event: CalendarEvent) => {
        const dialogRef = this.timetableEntryDialog(
            DialogMode.edit,
            this.timetable.entries[event.id].supervisor,
            event.extendedProps.room
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

    private onEventDrop = (eventDropInfo) => {
        this.run(updateTimetableEntry$(
            this.timetableService,
            this.timetable,
            eventDropInfo.event.id,
            updateTime(eventDropInfo.event.start, eventDropInfo.event.end)
        ))
    }

    private onEventResize = (eventResizeInfo) => {
        if (!isValidTimetableEntry(eventResizeInfo.event.start, eventResizeInfo.event.end)) {
            eventResizeInfo.revert()
            return
        }

        this.run(updateTimetableEntry$(
            this.timetableService,
            this.timetable,
            eventResizeInfo.event.id,
            updateTime(eventResizeInfo.event.start, eventResizeInfo.event.end)
        ))
    }

    private timetableEntryDialog = (mode: DialogMode, supervisors: User[], room?: Room) => {
        return TimetableEntryComponent.instance(
            this.dialog,
            mode,
            this.roomService.getAll(),
            supervisors,
            this.authorityService.getAuthoritiesForCourse(this.labwork.course.id).pipe(
                map(xs => xs.map(x => x.user))
            ),
            room
        )
    }

    private run = (o: Observable<TimetableAtom>) => {
        this.subs.push(subscribe(o, this.updateCalendar))
    }

    private allowSelect = (event): boolean => {
        return isValidTimetableEntry(event.start, event.end)
    }
}
