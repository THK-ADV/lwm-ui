import {Component, Input} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {AssignmentEntry} from '../../../models/assignment-plan.model'

@Component({
    selector: 'lwm-assignment-plan',
    templateUrl: './assignment-plan.component.html',
    styleUrls: ['./assignment-plan.component.scss'],
    standalone: false
})
export class AssignmentPlanComponent {
    @Input() labwork: Readonly<LabworkAtom>
    @Input() assignmentEntries: Readonly<AssignmentEntry[]>
}
