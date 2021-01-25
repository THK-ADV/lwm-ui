import {Observable} from 'rxjs'
import {ReportCardEntryService} from './../services/report-card-entry.service'
import {ReportCardEntryAtom, ReportCardEntryAtomJSON} from '../models/report-card-entry.model'
import {atomicParams, HttpService} from '../services/http.service'
import {StudentAtom} from '../models/user.model'
import {SemesterJSON} from '../models/semester.model'
import {CourseAtom} from '../models/course.model'
import {LabworkAtomJSON} from '../models/labwork.model'
import {AnnotationAtomJSON} from '../services/annotation.service'
import {ReportCardEvaluationJSON} from '../models/report-card-evaluation'
import {ReschedulePresentationStrategy} from '../report-card-table/report-card-table.component'
import {ReportCardRescheduledAtom} from '../models/report-card-rescheduled.model'
import {format, formatTime} from '../utils/lwmdate-adapter'

export const reportCardEntriesByCourseAndStudent$ = (
    service: ReportCardEntryService,
    courseId: string,
    studentId: string
): Observable<ReportCardEntryAtom[]> => service.getAllWithFilter(courseId, {attribute: 'student', value: studentId})

export interface StudentSearchDashboard {
    user: StudentAtom,
    semester: SemesterJSON,
    courses: CourseContent[]
}

export interface CourseContent {
    course: CourseAtom,
    labworks: Array<LabworkContent>
}

export interface LabworkContent {
    labwork: LabworkAtomJSON,
    reportCardEntries: [ReportCardEntryContent]
    evals: ReportCardEvaluationJSON[]
}

export interface ReportCardEntryContent {
    reportCardEntry: ReportCardEntryAtomJSON,
    annotations: AnnotationAtomJSON[]
}

export const fetchStudentSearchDashboard = (
    http: HttpService,
    studentId: string
): Observable<StudentSearchDashboard> =>
    http.get('studentSearch', studentId, atomicParams)

export const defaultStudentReschedulePresentationStrategy = (): ReschedulePresentationStrategy => (
    {
        kind: 'view',
        attrsAffectedByReschedule: [
            'date', 'start', 'end', 'room.label', 'label', 'assignmentIndex'
        ],
        indexAttr: 'assignmentIndex',
        rescheduleReasonAttr: 'label',
        rescheduledContentFor: (e: ReportCardRescheduledAtom, attr: string) => {
            switch (attr) {
                case 'date':
                    return format(e.date, 'dd.MM.yyyy')
                case 'start':
                    return formatTime(e.start, 'HH:mm')
                case 'end':
                    return formatTime(e.end, 'HH:mm')
                case 'room.label':
                    return e.room.label
                case 'label':
                    return e.reason ?? 'Kein Grund angegeben'
                default:
                    return ''
            }
        }
    }
)
