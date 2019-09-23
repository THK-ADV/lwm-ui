import {Injectable} from '@angular/core'
import {AssignmentPlan, AssignmentPlanProtocol} from '../models/assignment-plan.model'
import {Observable} from 'rxjs'
import {HttpService, nonAtomicParams} from './http.service'
import {applyFilter} from './http.filter'
import {makePath} from '../utils/component.utils'

interface AssignmentPlanFilter {
    attribute: 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class AssignmentPlanService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = (course: string) => makePath('assignmentPlans', course)

    getAllWithFilter = (
        courseId: string,
        ...filter: AssignmentPlanFilter[]
    ): Observable<AssignmentPlan[]> => this.http.getAll(this.path(courseId), applyFilter(filter, nonAtomicParams))

    update = (
        courseId: string,
        id: string,
        body: AssignmentPlanProtocol
    ): Observable<AssignmentPlan> => this.http.put(this.path(courseId), id, body)

    create = (
        courseId: string,
        body: AssignmentPlanProtocol
    ): Observable<AssignmentPlan> => this.http.create(this.path(courseId), body)
}
