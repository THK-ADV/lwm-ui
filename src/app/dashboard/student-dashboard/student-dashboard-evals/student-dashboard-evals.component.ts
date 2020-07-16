import {Component, Input, OnInit} from '@angular/core'
import {PassedEvaluation} from '../../../models/dashboard.model'

@Component({
    selector: 'lwm-student-dashboard-evals',
    templateUrl: './student-dashboard-evals.component.html',
    styleUrls: ['./student-dashboard-evals.component.scss']
})
export class StudentDashboardEvalsComponent implements OnInit {

    // TODO style

    @Input() passedEvals: PassedEvaluation[]

    constructor() {
    }

    ngOnInit(): void {
    }

    hasPassedLabworks = () =>
        this.passedEvals.length > 0
}
