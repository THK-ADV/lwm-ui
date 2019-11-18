import {Component, EventEmitter, Input, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'

@Component({
    selector: 'lwm-closing',
    templateUrl: './closing.component.html',
    styleUrls: ['./closing.component.scss']
})
export class ClosingComponent {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() reportCards: Readonly<number>
    @Input() hasPermission: Readonly<boolean>

    @Output() labworkUpdate: EventEmitter<LabworkAtom>

    constructor() {
        this.labworkUpdate = new EventEmitter<LabworkAtom>()
    }
}
