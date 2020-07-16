import {Employee, StudentAtom} from './user.model'
import {LabworkAtom} from './labwork.model'
import {LabworkApplicationAtom} from './labwork.application.model'
import {Semester} from './semester.model'
import {CourseAtom} from './course.model'
import {ScheduleEntryAtom} from './schedule-entry.model'
import {ReportCardEntryAtom} from './report-card-entry.model'

export interface PassedEvaluation {
    course: string
    semester: string
    passed: boolean
    bonus: number
}

export interface Dashboard {
    status: 'student' | 'employee'
    semester: Semester
}

export interface StudentDashboard extends Dashboard {
    user: StudentAtom
    labworks: LabworkAtom[]
    labworkApplications: LabworkApplicationAtom[]
    groups: { groupLabel: string, labwork: LabworkAtom }[]
    reportCardEntries: ReportCardEntryAtom[]
    // allEvaluations: TODO
    passedEvaluations: PassedEvaluation[]
}

export interface EmployeeDashboard extends Dashboard {
    user: Employee
    courses: CourseAtom[]
    scheduleEntries: ScheduleEntryAtom[]
}

