import {Room} from '../../models/room.model'
import {User} from '../../models/user.model'
import {Group} from '../../models/group.model'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {Time} from '../../models/time.model'
import {Blacklist} from '../../models/blacklist.model'
import {color, whiteColor} from '../../utils/colors'

export interface ExtendedProps {
    extendedProps: {
        room: Room,
        supervisor: User[],
        group: Group
    }
}
export interface ScheduleEntryEvent {
    title: string
    start: Date
    end: Date
    allDay: boolean
    borderColor: string
    backgroundColor: string
    textColor: string
    extendedProps: {
        room: Room,
        supervisor: User[],
        group: Group
    }
}

export type BlacklistEvent = Omit<ScheduleEntryEvent, ExtendedProps>

export const makeScheduleEntryEvents = (entries: Readonly<ScheduleEntryAtom[]>): ScheduleEntryEvent[] => {
    return entries.map(makeScheduleEntryEvent)
}

const makeScheduleEntryEvent = (e: ScheduleEntryAtom): ScheduleEntryEvent => {
    const backgroundColor = color('primary')
    const foregroundColor = whiteColor()

    return {
        allDay: false,
        start: Time.withNewDate(e.date, e.start).date,
        end: Time.withNewDate(e.date, e.end).date,
        title: `- Gruppe ${e.group.label}`,
        borderColor: backgroundColor,
        backgroundColor: backgroundColor,
        textColor: foregroundColor,
        extendedProps: {
            supervisor: e.supervisor,
            room: e.room,
            group: e.group
        }
    }
}

const makeBlacklistEvent = (b: Blacklist): BlacklistEvent => {
    const backgroundColor = color('warn')
    const foregroundColor = whiteColor()


    return {
        allDay: b.global,
        start: Time.withNewDate(b.date, b.start).date,
        end: Time.withNewDate(b.date, b.end).date,
        title: b.label,
        borderColor: backgroundColor,
        backgroundColor: backgroundColor,
        textColor: foregroundColor
    }
}
