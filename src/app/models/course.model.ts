import {Lecturer} from './user.model'

export interface CourseAtom {
    label: string
    description: string
    abbreviation: string
    lecturer: Lecturer
    semesterIndex: number
    id: string
}
