import {Blacklist, BlacklistJSON} from '../models/blacklist.model'
import {Time} from '../models/time.model'
import {Semester, SemesterJSON} from '../models/semester.model'
import {TimetableAtom, TimetableAtomJSON, TimetableEntryAtom, TimetableEntryAtomJSON} from '../models/timetable'
import {ScheduleEntryAtom, ScheduleEntryAtomJSON} from '../models/schedule-entry.model'
import {ScheduleEntryGen, ScheduleEntryGenJSON} from '../services/schedule-entry.service'
import {LabworkAtom, LabworkAtomJSON} from '../models/labwork.model'
import {ReportCardEntryAtom, ReportCardEntryAtomJSON} from '../models/report-card-entry.model'
import {ReportCardEvaluationAtom, ReportCardEvaluationAtomJSON} from '../models/report-card-evaluation'

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

export const mapScheduleEntryAtomJSON = (e: ScheduleEntryAtomJSON): ScheduleEntryAtom => {
    const date = new Date(e.date)

    return {
        ...e,
        date: date,
        start: Time.fromTimeString(e.start, date),
        end: Time.fromTimeString(e.end, date)
    }
}

export const mapScheduleEntryGenJSON = (e: ScheduleEntryGenJSON): ScheduleEntryGen => {
    const date = new Date(e.date)

    return {
        ...e,
        date: date,
        start: Time.fromTimeString(e.start, date),
        end: Time.fromTimeString(e.end, date)
    }
}

export const mapLabworkJSON = (x: LabworkAtomJSON): LabworkAtom => ({
    ...x,
    semester: mapSemesterJSON(x.semester)
})

export const mapReportCardEntryJSON = (x: ReportCardEntryAtomJSON): ReportCardEntryAtom => {
    const date = new Date(x.date)

    return {
        ...x,
        date: date,
        start: Time.fromTimeString(x.start, date),
        end: Time.fromTimeString(x.end, date)
    }
}

export const mapReportCardEvaluationJSON = (x: ReportCardEvaluationAtomJSON): ReportCardEvaluationAtom => {
    const date = new Date(x.lastModified)

    return {
        ...x,
        lastModified: date,
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

export const convertManyScheduleEntries = (se: ScheduleEntryAtomJSON[]): ScheduleEntryAtom[] => {
    return convertMany(se, mapScheduleEntryAtomJSON)
}

export const convertManyScheduleEntryGens = (se: ScheduleEntryGenJSON[]): ScheduleEntryGen[] => {
    return convertMany(se, mapScheduleEntryGenJSON)
}

export const convertManyLabworks = (xs: LabworkAtomJSON[]): LabworkAtom[] => {
    return convertMany(xs, mapLabworkJSON)
}

export const convertManyReportCardEntries = (xs: ReportCardEntryAtomJSON[]): ReportCardEntryAtom[] => {
    return convertMany(xs, mapReportCardEntryJSON)
}

export const convertManyReportCardEvaluations = (xs: ReportCardEvaluationAtomJSON[]): ReportCardEvaluationAtom[] => {
    return convertMany(xs, mapReportCardEvaluationJSON)
}
