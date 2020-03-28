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

    onApplicationChange = (arg: [Readonly<LabworkApplicationAtom>, ('add' | 'delete' | 'update')]) => {
        const [app, action] = arg

        switch (action) {
            case 'add':
                this.dashboard.labworkApplications.push(app)
                break
            case 'delete':
                this.dashboard.labworkApplications = this.dashboard.labworkApplications.filter(x => app.id !== x.id)
                break
            case 'update':
                this.dashboard.labworkApplications = this.dashboard.labworkApplications.map(x => x.id === app.id ? app : x)
                break
        }
    }
}
