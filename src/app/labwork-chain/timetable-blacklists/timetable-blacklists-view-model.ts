import {Blacklist, BlacklistProtocol} from '../../models/blacklist.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {Time} from '../../models/time.model'
import {Observable, of, zip} from 'rxjs'
import {TimetableService} from '../../services/timetable.service'
import {TimetableAtom} from '../../models/timetable'
import {updateTimetable$} from '../timetable/timetable-view-model'
import {BlacklistService} from '../../services/blacklist.service'
import {map, switchMap} from 'rxjs/operators'

export const fullBlacklistLabel = (blacklist: Blacklist): string => {
    let str = `${blacklist.label} am ${format(blacklist.date, 'dd.MM.yyyy')}`

    if (!isFullDay(blacklist)) {
        str += ` von ${formatTime(blacklist.start)} - ${formatTime(blacklist.end)}`
    }

    return str
}

const startOfDay = (time: Time): boolean => {
    return time.hour === 0 && time.minute === 0 && time.seconds === 0
}

const endOfDay = (time: Time): boolean => {
    return time.hour === 23 && time.minute === 59 && time.seconds === 59
}

export const isFullDay = (blacklist: Blacklist): boolean => {
    return startOfDay(blacklist.start) && endOfDay(blacklist.end)
}

export const removeBlacklistFromTimetable$ = (
    timetableService: TimetableService,
    blacklistService: BlacklistService,
    timetable: Readonly<TimetableAtom>
): (id: string) => Observable<TimetableAtom> => id => removeBlacklistFromTimetable$0(timetableService, timetable, id).pipe(
    switchMap(t => zip(blacklistService.delete(id), of(t))),
    map(xs => xs[1])
)

const removeBlacklistFromTimetable$0 = (
    timetableService: TimetableService,
    timetable: Readonly<TimetableAtom>,
    id: string
): Observable<TimetableAtom> => updateTimetable$(timetableService, timetable, u => {
    const copy = {...u}
    copy.localBlacklist = copy.localBlacklist.filter(x => x.id !== id)
    return copy
})

export const addBlacklistToTimetable$ = (
    timetableService: TimetableService,
    blacklistService: BlacklistService,
    timetable: Readonly<TimetableAtom>
): (b: BlacklistProtocol) => Observable<TimetableAtom> => {
    return b => blacklistService.create(b).pipe(
        switchMap(bl => addBlacklistToTimetable0(timetableService, timetable, bl))
    )
}

const addBlacklistToTimetable0 = (
    timetableService: TimetableService,
    timetable: Readonly<TimetableAtom>,
    blacklist: Blacklist
): Observable<TimetableAtom> => updateTimetable$(timetableService, timetable, u => {
    const copy = {...u}
    copy.localBlacklist.push(blacklist)
    return copy
})

export const updateBlacklistInTimetable$ = (
    blacklistService: BlacklistService,
    timetable: Readonly<TimetableAtom>,
    id: string
): (blacklist: BlacklistProtocol) => Observable<TimetableAtom> => blacklist => blacklistService.update(blacklist, id).pipe(
    map(updated => {
        const copy = {...timetable}
        copy.localBlacklist = copy.localBlacklist.map(b => b.id === updated.id ? updated : b)
        return copy
    })
)
