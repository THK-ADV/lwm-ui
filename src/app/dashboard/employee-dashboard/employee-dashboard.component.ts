import { Component, OnInit, OnDestroy } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {EmployeeDashboard} from '../../models/dashboard.model';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  private dashboardSubscription: Subscription
  private dashboard: EmployeeDashboard

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardSubscription = this.dashboardService.getDashboard<EmployeeDashboard>()
      .subscribe(dashboard => this.dashboard = dashboard)
  }

  ngOnDestroy(): void {
    this.dashboardSubscription.unsubscribe()
  }

}
