import { Component, OnInit } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {EmployeeDashboard} from '../../models/dashboard.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {

  constructor(private dashboard: DashboardService) { }

  async ngOnInit() {
    const dashboard = await this.dashboard.getDashboard<EmployeeDashboard>();
    console.log(dashboard);
  }

}
