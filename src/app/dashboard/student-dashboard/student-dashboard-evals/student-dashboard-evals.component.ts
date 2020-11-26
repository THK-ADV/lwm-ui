import {Component, Input, OnInit} from '@angular/core'
import {DashboardEvaluationResult} from '../../../models/dashboard.model'

@Component({
    selector: 'lwm-student-dashboard-evals',
    templateUrl: './student-dashboard-evals.component.html',
    styleUrls: ['./student-dashboard-evals.component.scss']
})
export class StudentDashboardEvalsComponent implements OnInit {

    // TODO style

    @Input() evals: DashboardEvaluationResult[]

    constructor() {
    }

    ngOnInit(): void {
    }

    hasPassedLabworks = () =>
        this.evals.length > 0
}
