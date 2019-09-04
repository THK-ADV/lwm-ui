import {Component, Input, OnInit, ViewChild} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {MatDialog} from '@angular/material'
import {TimetableService} from '../../services/timetable.service'
import {between, subscribe} from '../../utils/functions'
import {Observable, Subscription} from 'rxjs'
import {TimetableAtom, TimetableEntryAtom, TimetableEntryProtocol, TimetableProtocol} from '../../models/timetable'
import {User} from '../../models/user.model'
import {Time} from '../../models/time.model'
import {TimetableEntryComponent} from './timetable-entry/timetable-entry.component'
import {AuthorityService} from '../../services/authority.service'
import {map} from 'rxjs/operators'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {openDialog} from '../../utils/component.utils'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {Room} from '../../models/room.model'
import {RoomService} from '../../services/room.service'
import {Tuple} from '../../utils/tuple'

interface CalendarEvent {
    title: string
    start: Date
    end: Date
    editable: boolean
    id: number
    extendedProps: {
        dayIndex: number
        room: Room
    }
}

@Component({
    selector: 'lwm-timetable',
    templateUrl: './timetable.component.html',
    styleUrls: ['./timetable.component.scss']
})
export class TimetableComponent implements OnInit {

    @Input() labwork: LabworkAtom

    @ViewChild('calendar', {static: true}) calendar: FullCalendarComponent

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
        this.fetchTimetable(this.setCalendar)
    }

    private fetchTimetable = (completion: (t: TimetableAtom) => void) => {
        const s = subscribe(
            this.timetableService.getAllWithFilter(
                this.labwork.course.id,
                {attribute: 'labwork', value: this.labwork.id}
            ),
            timetables => {
                const timetable = timetables.shift()

                if (timetable) {
                    completion(timetable)
                }
            }
        )
        this.subs.push(s)
    }

    private setCalendar = (t: TimetableAtom) => {
        this.timetable = t

        const now = new Date()
        this.dates = t.entries
            .sort((lhs, rhs) => lhs.room.label.localeCompare(rhs.room.label))
            .map((e, i) => this.makeCalendarEvent(now, e, i))
    }

    private makeCalendarEvent = (now: Date, e: TimetableEntryAtom, i: number): CalendarEvent => {
        this.setWeekday(now, e.dayIndex)

        return {
            editable: false,
            title: `${e.room.label}\n\n ${this.supervisorLabel(e.supervisor)}`,
            start: Time.withNewDate(now, e.start).date,
            end: Time.withNewDate(now, e.end).date,
            extendedProps: {
                dayIndex: e.dayIndex,
                room: e.room,
            },
            id: i
        }
    }

    private supervisorLabel = (supervisors: User[]): string => {
        return supervisors
            .sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
            .map(this.shortUserName)
            .join('\n')
    }

    private setWeekday = (date: Readonly<Date>, weekday: Readonly<number>) => {
        if (!between(weekday, 1, 5)) {
            return
        }

        const currentDay = date.getDay()
        const distance = weekday - currentDay
        date.setDate(date.getDate() + distance)
    }

    private shortUserName = (u: User): string => {
        return `${u.firstname.charAt(0)}. ${u.lastname}`
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

        const updatedTimetable$ = openDialog(dialogRef, this.updateTimetableEntry$(event.id))
        const s = subscribe(updatedTimetable$, this.setCalendar)
        this.subs.push(s)
    }

    private updateTimetableEntry$ = (id: number): (t: Tuple<User[], Room>) => Observable<TimetableAtom> => {
        return tuple => {
            const copy = {...this.timetable}
            copy.entries[id].supervisor = [...tuple.first]
            copy.entries[id].room = tuple.second

            return this.timetableService.update(copy.labwork.id, copy.id, this.toTimetableProtocol(copy))
        }
    }

    private allowSelect = (event): boolean => {
        return event.end.getDay() === event.start.getDay()
    }

    private toTimetableProtocol = (t: TimetableAtom): TimetableProtocol => {
        return {
            labwork: t.labwork.id,
            start: format(t.start, 'yyyy-MM-dd'),
            localBlacklist: t.localBlacklist.map(x => x.id),
            entries: t.entries.map(this.toTimetableEntry)
        }
    }

    private toTimetableEntry = (e: TimetableEntryAtom): TimetableEntryProtocol => {
        return {
            dayIndex: e.dayIndex,
            room: e.room.id,
            supervisor: e.supervisor.map(x => x.id),
            start: formatTime(e.start),
            end: formatTime(e.end)
        }
    }
}
