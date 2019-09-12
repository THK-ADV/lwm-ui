import {ScheduleEntryGen} from '../../services/schedule-entry.service'
import {eventTitle, ScheduleEntryEvent} from '../schedule/schedule-view-model'
import {color, whiteColor} from '../../utils/colors'
import {Time} from '../../models/time.model'
import {_groupBy} from '../../utils/functions'
import {identity} from 'rxjs'

export const makeScheduleEntryEvents = (entries: Readonly<ScheduleEntryGen[]>): ScheduleEntryEvent[] => {
    const rooms = Object.keys(_groupBy(entries.flatMap(s => s.room), identity))
    return entries.map(makeScheduleEntryEvent(rooms))
}

const makeScheduleEntryEvent = (rooms: string[]): (e: ScheduleEntryGen) => ScheduleEntryEvent => {
    return e => {
        const backgroundColor = color('primary')
        const foregroundColor = whiteColor()
        const props = {
            supervisorLabel: `${e.supervisor.length.toString()} Betreuer`,
            roomLabel: `Raum ${rooms.indexOf(e.room) + 1}`,
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
}
