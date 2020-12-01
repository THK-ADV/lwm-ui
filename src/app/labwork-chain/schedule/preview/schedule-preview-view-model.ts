import {ScheduleEntryGen, ScheduleEntryGenProtocol, ScheduleEntryService} from '../../../services/schedule-entry.service'
import {scheduleEntryEventTitle, ScheduleEntryEvent, ScheduleEntryProps} from '../view/schedule-view-model'
import {color, whiteColor} from '../../../utils/colors'
import {Time} from '../../../models/time.model'
import {_groupBy, isEmpty} from '../../../utils/functions'
import {EMPTY, identity, Observable} from 'rxjs'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'
import {format, formatTime} from '../../../utils/lwmdate-adapter'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'

export const makeScheduleEntryEvents = (entries: Readonly<ScheduleEntryGen[]>): ScheduleEntryEvent<ScheduleEntryProps>[] => {
    const rooms = Object.keys(_groupBy(entries.flatMap(s => s.room), identity))
    return entries.map(makeScheduleEntryEvent(rooms))
}

const makeScheduleEntryEvent = (rooms: string[]): (e: ScheduleEntryGen) => ScheduleEntryEvent<ScheduleEntryProps> => {
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
            title: scheduleEntryEventTitle('month', props),
            borderColor: backgroundColor,
            backgroundColor: backgroundColor,
            textColor: foregroundColor,
            extendedProps: props
        }
    }
}

export const createSchedule = (
    courseId: string,
    labworkId: string,
    entries: Readonly<ScheduleEntryGen[]>,
    service: ScheduleEntryService
): Observable<ScheduleEntryAtom[]> => {
    if (isEmpty(entries)) {
        return EMPTY
    } else {
        return service.create(
            courseId,
            {labwork: labworkId, entries: scheduleEntryGenProtocol(entries)}
        )
    }
}

export const deleteSchedule = (
    courseId: string,
    labworkId: string,
    service: ScheduleEntryService
): Observable<unknown> => service.delete(courseId, labworkId)

export const deleteReportCardEntries = (
    courseId: string,
    labworkId: string,
    service: ReportCardEntryService
): Observable<unknown> => service.delete(courseId, labworkId)

const scheduleEntryGenProtocol = (
    xs: Readonly<ScheduleEntryGen[]>
): ScheduleEntryGenProtocol[] => xs.map(x => ({
    ...x,
    date: format(x.date, 'yyyy-MM-dd'),
    start: formatTime(x.start),
    end: formatTime(x.end)
}))
