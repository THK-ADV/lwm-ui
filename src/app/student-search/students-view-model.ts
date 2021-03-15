import {Observable} from 'rxjs'
import {ReportCardEntryAtomJSON} from '../models/report-card-entry.model'
import {atomicParams, HttpService} from '../services/http.service'
import {StudentAtom} from '../models/user.model'
import {SemesterJSON} from '../models/semester.model'
import {CourseAtom} from '../models/course.model'
import {LabworkAtomJSON} from '../models/labwork.model'
import {AnnotationAtomJSON} from '../services/annotation.service'
import {ReportCardEvaluationJSON} from '../models/report-card-evaluation'
import {ReportCardRescheduledAtomJSON} from '../models/report-card-rescheduled.model'

export interface StudentSearchDashboard {
    user: StudentAtom,
    semester: SemesterJSON,
    courses: CourseContent[]
}

export interface CourseContent {
    course: CourseAtom,
    labworks: LabworkContent[]
}

export interface LabworkContent {
    labwork: LabworkAtomJSON,
    reportCardEntries: ReportCardEntryContent[]
    evals: ReportCardEvaluationJSON[]
}

export interface ReportCardEntryContent {
    reportCardEntry: ReportCardEntryAtomJSON,
    annotations: AnnotationAtomJSON[]
    reschedules: ReportCardRescheduledAtomJSON[]
}

export const fetchStudentSearchDashboard = (
    http: HttpService,
    studentId: string
): Observable<StudentSearchDashboard> =>
    http.get('studentSearch', studentId, atomicParams)
