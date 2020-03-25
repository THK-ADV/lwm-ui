import {Employee, StudentAtom} from './user.model'
import {LabworkAtom} from './labwork.model'
import {LabworkApplicationAtom} from './labwork.application.model'
import {Semester} from './semester.model'
import {CourseAtom} from './course.model'
import {ScheduleEntryAtom} from './schedule-entry.model'

export interface Dashboard {
  status: 'student' | 'employee'
  semester: Semester
}

// case class StudentDashboard(
//     user: User,
//     status: LdapUserStatus,
//     semester: Semester,
//     labworks: Seq[LabworkLike],
//     labworkApplications: Seq[LabworkApplicationLike],
//     groups: Seq[(String, LabworkLike)],
//     reportCardEntries: Seq[ReportCardEntryLike],
//     allEvaluations: Seq[ReportCardEvaluationLike],
//     passedEvaluations: Seq[(String, String, Boolean, Int)]
// ) extends Dashboard

export interface StudentDashboard {
  status: string
  semester: Semester
  user?: StudentAtom
  labworks?: LabworkAtom[]
  labworkApplications?: LabworkApplicationAtom[]
  groups?: [string, LabworkAtom][]
  // cardEntries?: string; // Traversable[ReportCardEntryLike],
  // evaluations?: string; // Traversable[ReportCardEvaluationLike],
  // evaluationPatterns?: string; // Traversable[ReportCardEvaluationPattern]
}

export interface EmployeeDashboard extends Dashboard {
  user: Employee
  courses: CourseAtom[]
  scheduleEntries: ScheduleEntryAtom[]
}

