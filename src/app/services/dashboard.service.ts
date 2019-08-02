import { Injectable } from '@angular/core';
import { Dashboard, EmployeeDashboard, StudentDashboard } from '../models/dashboard.model';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getDashboard<T extends Dashboard>(): Observable<T> {
    return this.http.get<T>('dashboard');
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
