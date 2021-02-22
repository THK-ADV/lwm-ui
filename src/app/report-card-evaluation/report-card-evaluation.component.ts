import {Component} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {hasCourseManagerPermission} from '../security/user-authority-resolver'
import {params} from '../resolver/course-labwork-param-resolver'
import {Observable} from 'rxjs'
import {LabworkAtom} from '../models/labwork.model'
import {LabworkService} from '../services/labwork.service'

@Component({
    selector: 'lwm-report-card-evaluation',
    templateUrl: './report-card-evaluation.component.html',
    styleUrls: ['./report-card-evaluation.component.scss']
})
export class ReportCardEvaluationComponent {

    hasPermission = false
    labworkId: string
    courseId: string

    labwork$: Observable<LabworkAtom>

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService
    ) {
        const {course, labwork} = params(route)
        this.hasPermission = hasCourseManagerPermission(route, course)
        this.labwork$ = this.labworkService.get(course, labwork)
    }
}
