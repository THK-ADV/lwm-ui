import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Subscription} from 'rxjs'
import {LabworkApplicationAtom} from 'src/app/models/labwork.application.model'
import {subscribe} from '../../utils/functions'

@Component({
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

    dashboard: StudentDashboard

    private subs: Subscription[] = []

    constructor(private readonly service: DashboardService) {
    }

    ngOnInit() {
        this.subs.push(subscribe(this.service.getStudentDashboard(), d => this.dashboard = d))
    }

    removeApplication = (xs: LabworkApplicationAtom) => {
        this.dashboard.labworkApplications = this.dashboard.labworkApplications.filter(x => xs.id !== x.id)
    }

    addApplication = (xs: LabworkApplicationAtom) => {
        this.dashboard.labworkApplications.push(xs)
    }
}
