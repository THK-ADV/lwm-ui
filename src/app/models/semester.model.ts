export interface Semester {
    label: string
    abbreviation: string
    start: Date
    end: Date
    examStart: Date
    id: string
}

export interface SemesterProtocol {
    label: string
    abbreviation: string
    start: string
    end: string
    examStart: string
}

export interface SemesterJSON {
    label: string
    abbreviation: string
    start: string
    end: string
    examStart: string
    id: string
}
