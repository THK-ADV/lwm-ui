import {User, StudentAtom, Employee} from './user.model';
import { Semester } from './semester.model';
import { CourseAtom } from './course.model';
import { ScheduleEntryLike } from '../labwork-chain/abstract-group-view/abstract-group-view.component';

export interface Dashboard {
  status: string;
  semester: Semester;
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
  courses?: CourseAtom[];
  scheduleEntries?: ScheduleEntryLike[]
}

