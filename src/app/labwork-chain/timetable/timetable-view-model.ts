import {TimetableAtom, TimetableEntryAtom, TimetableEntryProtocol, TimetableProtocol} from '../../models/timetable'
import {Time} from '../../models/time.model'
import {User} from '../../models/user.model'
import {between} from '../../utils/functions'
import {Room} from '../../models/room.model'
import {Observable} from 'rxjs'
import {TimetableService} from '../../services/timetable.service'
import {format, formatTime} from '../../utils/lwmdate-adapter'

export interface CalendarEvent {
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

export const makeCalendarEvents = (t: TimetableAtom): CalendarEvent[] => {
    const now = new Date()
    return t.entries
        .sort((lhs, rhs) => lhs.room.label.localeCompare(rhs.room.label))
        .map((e, i) => makeCalendarEvent(now, e, i))
}

const makeCalendarEvent = (now: Date, e: Readonly<TimetableEntryAtom>, i: number): CalendarEvent => {
    shiftToWeekday(now, e.dayIndex)

    return {
        editable: true, // TODO permission check
        title: `${e.room.label}\n\n${supervisorLabel(e.supervisor)}`,
        start: Time.withNewDate(now, e.start).date,
        end: Time.withNewDate(now, e.end).date,
        extendedProps: {
            dayIndex: e.dayIndex,
            room: e.room,
        },
        id: i
    }
}

const supervisorLabel = (supervisors: User[]): string => {
    return supervisors
        .sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
        .map(shortUserName)
        .join('\n')
}

const shiftToWeekday = (date: Readonly<Date>, wd: Readonly<number>) => {
    if (!between(wd, 1, 5)) {
        return
    }

    const currentDay = dayIndex(date)
    const distance = wd - currentDay
    date.setDate(date.getDate() + distance)
}

export const shortUserName = (u: User): string => {
    return `${u.firstname.charAt(0)}. ${u.lastname}`
}

export const updateTimetableEntry$ = (
    service: TimetableService,
    existing: Readonly<TimetableAtom>,
    id: number,
    update: (e: Readonly<TimetableEntryAtom>) => Readonly<TimetableEntryAtom>
): Observable<TimetableAtom> => {
    const copy = {...existing}
    copy.entries[id] = update(copy.entries[id])
    return service.update(copy.labwork.id, copy.id, toTimetableProtocol(copy))
}

export const removeTimetableEntry$ = (
    service: TimetableService,
    existing: Readonly<TimetableAtom>,
    id: number
): Observable<TimetableAtom> => {
    const copy = {...existing}
    copy.entries.splice(id, 1)
    return service.update(copy.labwork.id, copy.id, toTimetableProtocol(copy))
}

export const createTimetableEntry$ = (
    service: TimetableService,
    existing: Readonly<TimetableAtom>,
    supervisor: Readonly<User[]>,
    room: Readonly<Room>,
    start: Date,
    end: Date
): Observable<TimetableAtom> => {
    const copy = {...existing}
    copy.entries.push({
        dayIndex: dayIndex(start),
        room: room,
        supervisor: [...supervisor],
        start: Time.fromDate(start),
        end: Time.fromDate(end)
    })

    return service.update(copy.labwork.id, copy.id, toTimetableProtocol(copy))
}

export const updateTimetable$ = (
    service: TimetableService,
    existing: Readonly<TimetableAtom>,
    update: (t: Readonly<TimetableAtom>) => Readonly<TimetableAtom>
): Observable<TimetableAtom> => {
    const copy = {...existing}
    return service.update(copy.labwork.id, copy.id, toTimetableProtocol(update(copy)))
}

const toTimetableProtocol = (t: TimetableAtom): TimetableProtocol => {
    return {
        labwork: t.labwork.id,
        start: format(t.start, 'yyyy-MM-dd'),
        localBlacklist: t.localBlacklist.map(x => x.id),
        entries: t.entries.map(toTimetableEntry)
    }
}

const toTimetableEntry = (e: TimetableEntryAtom): TimetableEntryProtocol => {
    return {
        dayIndex: e.dayIndex,
        room: e.room.id,
        supervisor: e.supervisor.map(x => x.id),
        start: formatTime(e.start),
        end: formatTime(e.end)
    }
}

export const updateTime = (start: Date, end: Date): (entry: Readonly<TimetableEntryAtom>) => Readonly<TimetableEntryAtom> => {
    return entry => {
        const index = entry.dayIndex === dayIndex(start) ? entry.dayIndex : dayIndex(start)
        return {...entry, start: Time.fromDate(start), end: Time.fromDate(end), dayIndex: index}
    }
}

export const updateSupervisorAndRoom = (
    room: Room, supervisors: User[]
): (entry: Readonly<TimetableEntryAtom>) => Readonly<TimetableEntryAtom> => {
    return entry => ({...entry, supervisor: supervisors, room: room})
}

export const updateStartDate = (date: Date): (t: Readonly<TimetableAtom>) => Readonly<TimetableAtom> => {
    return t => ({...t, start: date})
}

export const isValidTimetableEntry = (start: Date, end: Date): boolean => {
    return dayIndex(start) === dayIndex(end)
}

const dayIndex = (date: Readonly<Date>): number => {
    return date.getDay()
}
