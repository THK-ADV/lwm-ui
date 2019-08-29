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

    private readonly path = 'assignmentPlans'

    getAllWithFilter(courseId: string, ...filter: AssignmentPlanFilter[]): Observable<AssignmentPlan[]> {
        return this.http.getAll(makePath(this.path, courseId), applyFilter(filter, nonAtomicParams))
    }

    update(courseId: string, id: string, body: AssignmentPlanProtocol): Observable<AssignmentPlan> {
        return this.http.put(makePath(this.path, courseId), id, body)
    }
}
