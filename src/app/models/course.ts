import {Lecturer} from './user.model'

export interface Course {
    label: string
    description: string
    abbreviation: string
    lecturer: string
    semesterIndex: number
    id: string
}

export interface CourseAtom {
    label: string
    description: string
    abbreviation: string
    lecturer: Lecturer
    semesterIndex: number
    id: string
}
