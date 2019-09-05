import {TimetableAtom, TimetableEntryAtom, TimetableEntryProtocol, TimetableProtocol} from '../../models/timetable'
import {Time} from '../../models/time.model'
import {User} from '../../models/user.model'
import {between, subscribe} from '../../utils/functions'
import {Room} from '../../models/room.model'
import {Observable, Subscription} from 'rxjs'
import {TimetableService} from '../../services/timetable.service'
import {LabworkAtom} from '../../models/labwork.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {Tuple} from '../../utils/tuple'

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

export const fetchTimetable = (
    service: TimetableService,
    labwork: LabworkAtom,
    completion: (t: TimetableAtom) => void
): Subscription => {
    return subscribe(
        service.getAllWithFilter(
            labwork.course.id,
            {attribute: 'labwork', value: labwork.id}
        ),
        timetables => {
            const timetable = timetables.shift()

            if (timetable) {
                completion(timetable)
            }
        }
    )
}

export const makeCalendarEvents = (t: TimetableAtom): CalendarEvent[] => {
    const now = new Date()
    return t.entries
        .sort((lhs, rhs) => lhs.room.label.localeCompare(rhs.room.label))
        .map((e, i) => makeCalendarEvent(now, e, i))
}

const makeCalendarEvent = (now: Date, e: Readonly<TimetableEntryAtom>, i: number): CalendarEvent => {
    setWeekday(now, e.dayIndex)

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

const setWeekday = (date: Readonly<Date>, weekday: Readonly<number>) => {
    if (!between(weekday, 1, 5)) {
        return
    }

    const currentDay = date.getDay()
    const distance = weekday - currentDay
    date.setDate(date.getDate() + distance)
}

const shortUserName = (u: User): string => {
    return `${u.firstname.charAt(0)}. ${u.lastname}`
}

export const updateTimetableEntry$ = (
    service: TimetableService,
    t: Readonly<TimetableAtom>,
    id: number,
    update: (e: Readonly<TimetableEntryAtom>) => Readonly<TimetableEntryAtom>
): Observable<TimetableAtom> => {
    const copy = {...t}
    copy.entries[id] = update(copy.entries[id])
    return service.update(copy.labwork.id, copy.id, toTimetableProtocol(copy))
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
        const dayIndex = entry.dayIndex === start.getDay() ? entry.dayIndex : start.getDay()
        return {...entry, start: Time.fromDate(start), end: Time.fromDate(end), dayIndex: dayIndex}
    }
}

export const updateSupervisorAndRoom = (tuple: Tuple<User[], Room>): (entry: Readonly<TimetableEntryAtom>) => Readonly<TimetableEntryAtom> => {
    return entry => ({...entry, supervisor: [...tuple.first], room: tuple.second})
}

export const isValidTimetableEntry = (start: Date, end: Date): boolean => {
    return start.getDay() === end.getDay()
}
