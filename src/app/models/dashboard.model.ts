import {User, StudentAtom, Employee} from './user.model';
import {LabworkAtom} from './labwork.model'
import {LabworkApplicationAtom} from './labwork.application.model'
import {Semester} from './semester.model'

export interface Dashboard {
  status: string;
  semester: string; // Semester;
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
  user?: Employee;
  courses?: string; // Traversable[CourseAtom],
  scheduleEntries?: string; // Traversable[ScheduleEntryLike]
}

