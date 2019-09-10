import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {Time} from '../../models/time.model'
import {Blacklist} from '../../models/blacklist.model'
import {color, whiteColor} from '../../utils/colors'
import {User} from '../../models/user.model'
import {Room} from '../../models/room.model'
import {Group} from '../../models/group.model'
import {shortUserName} from '../timetable/timetable-view-model'

type CalendarView = 'month' | 'list'

export interface ExtendedProps {
    supervisor: User[]
    room: Room
    group: Group
}

export interface ScheduleEntryEvent {
    title: string
    start: Date
    end: Date
    allDay: boolean
    borderColor: string
    backgroundColor: string
    textColor: string
    extendedProps?: ExtendedProps
}

export const makeScheduleEntryEvents = (entries: Readonly<ScheduleEntryAtom[]>): ScheduleEntryEvent[] => {
    return entries.map(makeScheduleEntryEvent)
}

export const makeBlacklistEvents = (blacklists: Blacklist[]): ScheduleEntryEvent[] => {
    return blacklists.map(makeBlacklistEvent)
}

const makeScheduleEntryEvent = (e: ScheduleEntryAtom): ScheduleEntryEvent => {
    const backgroundColor = color('primary')
    const foregroundColor = whiteColor()
    const props = {
        supervisor: e.supervisor,
        room: e.room,
        group: e.group
    }

    return {
        allDay: false,
        start: Time.withNewDate(e.date, e.start).date,
        end: Time.withNewDate(e.date, e.end).date,
        title: eventTitle('month', props),
        borderColor: backgroundColor,
        backgroundColor: backgroundColor,
        textColor: foregroundColor,
        extendedProps: props
    }
}

const makeBlacklistEvent = (b: Blacklist): ScheduleEntryEvent => {
    const backgroundColor = color('warn')
    const foregroundColor = whiteColor()

    return {
        allDay: true,
        start: Time.withNewDate(b.date, b.start).date,
        end: Time.withNewDate(b.date, b.end).date,
        title: b.label,
        borderColor: backgroundColor,
        backgroundColor: backgroundColor,
        textColor: foregroundColor
    }
}

export const eventEntriesForMonth = (entries: ScheduleEntryEvent[]) => {
    return entries.map(d => {
        const copy = {...d}

        if (copy.extendedProps) {
            copy.title = eventTitle('month', copy.extendedProps)
        }

        return copy
    })
}

export const eventEntriesForList = (entries: ScheduleEntryEvent[]) => {
    return entries.map(d => {
        const copy = {...d}

        if (copy.extendedProps) {
            copy.title = eventTitle('list', copy.extendedProps)
        }

        return copy
    })
}

const supervisorLabel = (supervisors: User[]): string => {
    return supervisors
        .sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
        .map(shortUserName)
        .join(', ')
}

const eventTitle = (view: CalendarView, props: ExtendedProps) => {
    switch (view) {
        case 'month':
            return `- Gruppe ${props.group.label} (${props.room.label})`
        case 'list':
            const supervisors = supervisorLabel(props.supervisor)
            return `Gruppe ${props.group.label} (${props.room.label}):\t ${supervisors}`
    }
}
