import {Component, OnInit} from '@angular/core'
import {DashboardService} from '../../services/dashboard.service'
import {StudentDashboard} from '../../models/dashboard.model'
import {Observable} from 'rxjs'
import {LabworkAtom} from 'src/app/models/labwork.model'
import {map} from 'rxjs/operators'

@Component({
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

    dashboard$: Observable<StudentDashboard>
    labworks: LabworkAtom[]

    constructor(private readonly service: DashboardService) {
    }

    ngOnInit() {
        this.dashboard$ = this.service.getStudentDashboard()//.pipe(map(x => ({...x, labworks: []})))
    }

    isApplicant = (id: string) => true
}
