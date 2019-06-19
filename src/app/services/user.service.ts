import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Dashboard, EmployeeDashboard, StudentDashboard } from '../models/dashboard.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getInitials (user: User): string{
    var initials = user.firstname.substring(0, 1).toUpperCase() + user.lastname.substring(0, 1).toUpperCase()
    return initials
  }

}

