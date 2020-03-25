import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Observable} from 'rxjs'

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

  dashboard$: Observable<StudentDashboard>

  constructor(private readonly service: DashboardService) { }

  ngOnInit() {
    this.dashboard$ = this.service.getStudentDashboard()

  }

}
