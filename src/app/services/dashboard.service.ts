import {Injectable} from '@angular/core'
import {EmployeeDashboard, StudentDashboard} from '../models/dashboard.model'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {SemesterJSON} from '../models/semester.model'
import {Employee, StudentAtom} from '../models/user.model'
import {CourseAtom} from '../models/course.model'
import {ScheduleEntryAtomJSON} from '../models/schedule-entry.model'
import {
    convertManyLabworks,
    convertManyReportCardEntries,
    convertManyScheduleEntries,
    mapLabworkJSON,
    mapSemesterJSON
} from '../utils/http-utils'
import {map} from 'rxjs/operators'
import {LabworkAtomJSON} from '../models/labwork.model'
import {LabworkApplicationAtom} from '../models/labwork.application.model'
import {ReportCardEntryAtomJSON} from '../models/report-card-entry.model'

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
    groups: [string, LabworkAtomJSON][]
    reportCardEntries: ReportCardEntryAtomJSON[]
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'dashboard'

    getStudentDashboard = (): Observable<StudentDashboard> =>
        this.http.get_<StudentDashboardJSON>(this.path)
            .pipe(map(this.studentDashboardFromJSON))

    getEmployeeDashboard = (): Observable<EmployeeDashboard> =>
        this.http.get_<EmployeeDashboardJSON>(this.path)
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
        reportCardEntries: convertManyReportCardEntries(x.reportCardEntries),
        groups: x.groups.map(_ => [_[0], mapLabworkJSON(_[1])])
    })
}
