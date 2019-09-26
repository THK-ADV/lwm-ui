import { Injectable } from '@angular/core';
import { Dashboard, EmployeeDashboard, StudentDashboard, EmployeeDashboardJSON } from '../models/dashboard.model';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { convertDashboard } from '../utils/http-utils';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getEmployeeDashboard(): Observable<EmployeeDashboard> {
    return this.http.get<EmployeeDashboardJSON>('dashboard?entriesSinceNow=false')
      .pipe(map(convertDashboard))
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
