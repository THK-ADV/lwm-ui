import {Component, OnDestroy, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {EmployeeDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {ActivatedRoute} from '@angular/router'

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
    private dashboardSubscription: Subscription
    private dashboard: EmployeeDashboard

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        // this.dashboardSubscription = this.dashboardService.getDashboard<EmployeeDashboard>()
        //   .subscribe(dashboard => this.dashboard = dashboard)
    }

    ngOnDestroy(): void {
        // this.dashboardSubscription.unsubscribe()
    }

}
