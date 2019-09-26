import { User, StudentAtom, Employee } from './user.model';
import { Semester, SemesterJSON } from './semester.model';
import { CourseAtom } from './course.model';
import { ScheduleEntryAtom, ScheduleEntryAtomJSON } from './schedule-entry.model';

export interface Dashboard {
  status: string;
  semester: Semester;
}

export interface DashboardJSON {
  status: string;
  semester: SemesterJSON;
}

export interface StudentDashboard extends Dashboard {
  user?: StudentAtom;
  labworks?: string; // Traversable[LabworkLike],
  applications?: string; // Traversable[LabworkApplicationLike],
  groups?: string; // Traversable[GroupLike],
  cardEntries?: string; // Traversable[ReportCardEntryLike],
  evaluations?: string; // Traversable[ReportCardEvaluationLike],
  evaluationPatterns?: string; // Traversable[ReportCardEvaluationPattern]
}

export interface EmployeeDashboard extends Dashboard {
  user: Employee
  courses: CourseAtom[]
  scheduleEntries: ScheduleEntryAtom[]
}

export interface EmployeeDashboardJSON extends DashboardJSON {
  user: Employee
  courses: CourseAtom[]
  scheduleEntries: ScheduleEntryAtomJSON[]
}