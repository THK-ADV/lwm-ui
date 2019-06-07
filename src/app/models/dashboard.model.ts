import {User} from './user.model';
import {Student} from './student.model';
import {Employee} from './employee.model';

export interface Dashboard {
  user?: User;
  status: string;
  semester: string; // Semester;
}

export interface StudentDashboard extends Dashboard {
  user?: Student;
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

