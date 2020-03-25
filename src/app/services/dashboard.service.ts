import {Injectable} from '@angular/core'
import {Dashboard, StudentDashboard} from '../models/dashboard.model'
import {HttpClient} from '@angular/common/http'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpService) {
    }

    getStudentDashboard(): Observable<StudentDashboard> {
        return this.http.get_<StudentDashboard>('dashboard')
    }

    // getDashboardForCurrentSession(): Promise<StudentDashboard | EmployeeDashboard> {
    //   return this.http.getAll<Dashboard>('dashboard').pipe(
    //     map(dashboard => {
    //       switch (dashboard.status) {
    //         case 'student': return <StudentDashboard>dashboard;
    //         case 'employee': return <EmployeeDashboard>dashboard;
    //       }
    //     }
    //     ),
    //     map(dashboard => {
    //       console.log(dashboard);
    //       return dashboard;
    //     })
    //   ).toPromise();

    // }
}
