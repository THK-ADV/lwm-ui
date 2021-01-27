import {Component, OnDestroy, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {subscribe} from '../../utils/functions'

@Component({
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {

    // TODO add badges which link to the report-cards respectively
    // TODO show rescheduled entries

    dashboard: StudentDashboard

    private sub: Subscription

    constructor(
        private readonly service: DashboardService,
    ) {
    }

    ngOnInit() {
        this.sub = subscribe(
            this.service.getStudentDashboard({attribute: 'entriesSinceNow', value: 'false'}),
            d => this.dashboard = d
        )
    }

    ngOnDestroy() {
        this.sub.unsubscribe()
    }
}
