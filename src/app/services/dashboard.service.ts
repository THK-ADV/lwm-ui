import {Injectable} from '@angular/core'
import {DashboardEvaluationResult, DashboardGroupLabel, EmployeeDashboard, StudentDashboard} from '../models/dashboard.model'
import {Observable} from 'rxjs'
import {atomicParams, HttpService} from './http.service'
import {SemesterJSON} from '../models/semester.model'
import {Employee, StudentAtom} from '../models/user.model'
import {CourseAtom} from '../models/course.model'
import {ScheduleEntryAtomJSON} from '../models/schedule-entry.model'
import {
    convertManyLabworks,
    convertManyReportCardRescheduledAtomJSON,
    convertManyScheduleEntries,
    mapReportCardEntryAtomJSON,
    mapSemesterJSON
} from '../utils/http-utils'
import {map} from 'rxjs/operators'
import {LabworkAtomJSON} from '../models/labwork.model'
import {LabworkApplicationAtom} from '../models/labwork.application.model'
import {ReportCardEntryAtomJSON} from '../models/report-card-entry.model'
import {applyFilter} from './http.filter'
import {ReportCardRescheduledAtomJSON} from '../models/report-card-rescheduled.model'

interface DashboardJSON {
    status: 'student' | 'employee'
    semester: SemesterJSON
}

interface EmployeeDashboardJSON extends DashboardJSON {
    user: Employee
    courses: CourseAtom[]
    scheduleEntries: ScheduleEntryAtomJSON[]
}

interface StudentDashboardJSON extends DashboardJSON {
    user: StudentAtom
    labworks: LabworkAtomJSON[]
    labworkApplications: LabworkApplicationAtom[]
    groups: DashboardGroupLabel[]
    reportCardEntries: [ReportCardEntryAtomJSON, ReportCardRescheduledAtomJSON[]][]
    evaluationResults: DashboardEvaluationResult[]
    scheduleEntries: ScheduleEntryAtomJSON[]
}

interface DashboardHttpFilter {
    attribute: 'ownEntriesOnly' | 'entriesSinceNow'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'dashboard'

    getStudentDashboard = (...filter: DashboardHttpFilter[]): Observable<StudentDashboard> =>
        this.http.get_<StudentDashboardJSON>(this.path, applyFilter(filter, atomicParams))
            .pipe(map(this.studentDashboardFromJSON))

    getEmployeeDashboard = (...filter: DashboardHttpFilter[]): Observable<EmployeeDashboard> =>
        this.http.get_<EmployeeDashboardJSON>(this.path, applyFilter(filter, atomicParams))
            .pipe(map(this.employeeDashboardFromJSON))

    private employeeDashboardFromJSON = (x: EmployeeDashboardJSON): EmployeeDashboard => ({
        ...x,
        semester: mapSemesterJSON(x.semester),
        scheduleEntries: convertManyScheduleEntries(x.scheduleEntries)
    })

    private studentDashboardFromJSON = (x: StudentDashboardJSON): StudentDashboard => ({
        ...x,
        semester: mapSemesterJSON(x.semester),
        labworks: convertManyLabworks(x.labworks),
        reportCardEntries: x.reportCardEntries.map(([e, rs]) =>
            [mapReportCardEntryAtomJSON(e), convertManyReportCardRescheduledAtomJSON(rs)]
        ),
        scheduleEntries: convertManyScheduleEntries(x.scheduleEntries)
    })
}
