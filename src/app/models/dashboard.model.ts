import { Employee, StudentAtom } from "./user.model"
import { LabworkAtom } from "./labwork.model"
import { LabworkApplicationAtom } from "./labwork.application.model"
import { Semester } from "./semester.model"
import { CourseAtom } from "./course.model"
import { ScheduleEntryAtom } from "./schedule-entry.model"
import { ReportCardEntryAtom } from "./report-card-entry.model"
import { ReportCardRescheduledAtom } from "./report-card-rescheduled.model"

export interface Dashboard {
  status: "student" | "employee"
  semester: Semester
}

export interface StudentDashboard extends Dashboard {
  user: StudentAtom
  labworks: LabworkAtom[]
  labworkApplications: LabworkApplicationAtom[]
  groups: DashboardGroupLabel[]
  reportCardEntries: [ReportCardEntryAtom, ReportCardRescheduledAtom[]][]
  evaluationResults: DashboardEvaluationResult[]
  scheduleEntries: ScheduleEntryAtom[]
}

export interface EmployeeDashboard extends Dashboard {
  user: Employee
  courses: CourseAtom[]
  scheduleEntries: ScheduleEntryAtom[]
}

export interface DashboardEvaluationResult {
  course: string
  semester: string
  passed: boolean
  bonus: number
}

export interface DashboardGroupLabel {
  groupLabel: string
  labworkLabel: string
  labworkId: string
}
