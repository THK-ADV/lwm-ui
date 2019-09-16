import {Component, Input} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {AssignmentPlan} from '../../models/assignment-plan.model'

@Component({
    selector: 'lwm-assignment-plan',
    templateUrl: './assignment-plan.component.html',
    styleUrls: ['./assignment-plan.component.scss']
})
export class AssignmentPlanComponent {
    @Input() labwork: Readonly<LabworkAtom>
    @Input() plan: Readonly<AssignmentPlan>
}
