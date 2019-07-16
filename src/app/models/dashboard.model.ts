import {User, StudentAtom, Employee} from './user.model';

export interface Dashboard {
  status: string;
  semester: string; // Semester;
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
  user?: Employee;
  courses?: string; // Traversable[CourseAtom],
  scheduleEntries?: string; // Traversable[ScheduleEntryLike]
}

