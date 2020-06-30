import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {hasCourseManagerPermission} from '../security/user-authority-resolver'
import {params} from '../resolver/course-labwork-param-resolver'
import {Observable} from 'rxjs'
import {Labwork} from '../models/labwork.model'
import {LabworkService} from '../services/labwork.service'

@Component({
    selector: 'lwm-report-card-evaluation',
    templateUrl: './report-card-evaluation.component.html',
    styleUrls: ['./report-card-evaluation.component.scss']
})
export class ReportCardEvaluationComponent implements OnInit, OnDestroy {

    hasPermission = false
    labworkId: string
    courseId: string

    labwork$: Observable<Labwork>

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService
    ) {
        const p = params(route)
        this.labworkId = p.labwork
        this.courseId = p.course
        this.hasPermission = hasCourseManagerPermission(route, p.course)
    }

    ngOnInit(): void {
        this.labwork$ = this.labworkService.getNonAtom(this.courseId, this.labworkId)
    }

    ngOnDestroy() {
    }


    paramsLoaded = () =>
        this.labworkId !== undefined && this.courseId !== undefined
}
