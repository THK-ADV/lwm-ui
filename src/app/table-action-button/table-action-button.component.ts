import {Component, EventEmitter, Input, Output} from '@angular/core'
import {LWMAction, LWMActionType} from './lwm-actions'

@Component({
    selector: 'lwm-table-action-button',
    templateUrl: './table-action-button.component.html',
    styleUrls: ['./table-action-button.component.scss']
})
export class TableActionButtonComponent { // TODO apply this everywhere

    @Input() actions: LWMAction[]
    @Output() performAction: EventEmitter<LWMActionType> = new EventEmitter()
}
