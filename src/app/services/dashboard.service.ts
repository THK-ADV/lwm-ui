import {Injectable} from '@angular/core'
import {EmployeeDashboard, StudentDashboard} from '../models/dashboard.model'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'
import {SemesterJSON} from '../models/semester.model'
import {Employee} from '../models/user.model'
import {CourseAtom} from '../models/course.model'
import {ScheduleEntryAtomJSON} from '../models/schedule-entry.model'
import {convertManyScheduleEntries, mapSemesterJSON} from '../utils/http-utils'
import {map} from 'rxjs/operators'

interface DashboardJSON {
    status: 'student' | 'employee'
    semester: SemesterJSON
}

interface EmployeeDashboardJSON extends DashboardJSON {
    user: Employee
    courses: CourseAtom[]
    scheduleEntries: ScheduleEntryAtomJSON[]
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'dashboard'

    getStudentDashboard = (): Observable<StudentDashboard> =>
        this.http.get_<StudentDashboard>(this.path)

    getEmployeeDashboard = (): Observable<EmployeeDashboard> =>
        this.http.get_<EmployeeDashboardJSON>(this.path)
            .pipe(map(this.fromJSON))

    private fromJSON = (x: EmployeeDashboardJSON): EmployeeDashboard => ({
        ...x,
        semester: mapSemesterJSON(x.semester),
        scheduleEntries: convertManyScheduleEntries(x.scheduleEntries)
    })
}
