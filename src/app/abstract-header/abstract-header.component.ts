import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {action, LWMAction, LWMActionType} from '../table-action-button/lwm-actions'

@Component({
    selector: 'lwm-abstract-header',
    templateUrl: './abstract-header.component.html',
    styleUrls: ['./abstract-header.component.scss']
})
export class AbstractHeaderComponent implements OnInit {
    @Input() headerTitle: string
    @Input() actionTypes: LWMActionType[]

    @Output() performAction: EventEmitter<LWMActionType>

    private actions_: LWMAction[]

    constructor() {
        this.performAction = new EventEmitter<LWMActionType>()
        this.actionTypes = []
        this.actions_ = []
    }

    ngOnInit(): void {
        this.actions_ = this.actionTypes.map(action)
    }

}
