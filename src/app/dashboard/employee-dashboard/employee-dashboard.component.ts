import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {EmployeeDashboard} from '../../models/dashboard.model'
import {Observable} from 'rxjs'
import {ActivatedRoute} from '@angular/router'
import {groupBy, map} from 'rxjs/operators'
import {_groupBy} from '../../utils/functions'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {

    dashboard$: Observable<EmployeeDashboard>

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        this.dashboard$ = this.dashboardService.getEmployeeDashboard()
    }

    groupByLabworks = (xs: ScheduleEntryAtom[]) => _groupBy(xs, x => x.labwork.id)

}
