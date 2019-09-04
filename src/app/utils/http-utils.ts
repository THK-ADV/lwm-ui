import {Blacklist, BlacklistJSON} from '../models/blacklist.model'
import {Time} from '../models/time.model'
import {Semester, SemesterJSON} from '../models/semester.model'
import {TimetableAtom, TimetableAtomJSON, TimetableEntryAtom, TimetableEntryAtomJSON} from '../models/timetable'

const convertMany = <A, B>(xs: A[], f: (a: A) => B): B[] => xs.map(f)

export const mapBlacklistJSON = (b: BlacklistJSON): Blacklist => {
    const date = new Date(b.date)

    return {
        label: b.label,
        date: date,
        start: Time.fromTimeString(b.start, date),
        end: Time.fromTimeString(b.end, date),
        global: b.global,
        id: b.id
    }
}

export const mapSemesterJSON = (s: SemesterJSON): Semester => (
    {
        label: s.label,
        abbreviation: s.abbreviation,
        start: new Date(s.start),
        end: new Date(s.end),
        examStart: new Date(s.examStart),
        id: s.id
    }
)

export const mapTimetableAtomJSON = (t: TimetableAtomJSON): TimetableAtom => {
    const date = new Date(t.start)

    return {
        labwork: t.labwork,
        id: t.id,
        start: date,
        entries: convertManyTimetablesEntries(t.entries, date),
        localBlacklist: convertManyBlacklists(t.localBlacklist)
    }
}

export const mapTimetableEntryAtomJSON = (d: Date): (e: TimetableEntryAtomJSON) => TimetableEntryAtom => {
    return e => {
        const start = Time.fromTimeString(e.start, d)
        const end = Time.fromTimeString(e.end, d)

        return {
            start: start,
            end: end,
            supervisor: e.supervisor,
            room: e.room,
            dayIndex: e.dayIndex
        }
    }
}

export const convertManySemesters = (ss: SemesterJSON[]): Semester[] => {
    return convertMany(ss, mapSemesterJSON)
}

export const convertManyBlacklists = (bls: BlacklistJSON[]): Blacklist[] => {
    return convertMany(bls, mapBlacklistJSON)
}

export const convertManyTimetables = (tt: TimetableAtomJSON[]): TimetableAtom[] => {
    return convertMany(tt, mapTimetableAtomJSON)
}

export const convertManyTimetablesEntries = (es: TimetableEntryAtomJSON[], date: Date): TimetableEntryAtom[] => {
    return convertMany(es, mapTimetableEntryAtomJSON(date))
}
