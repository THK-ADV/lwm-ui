import {Component, EventEmitter, Input, Output} from '@angular/core'
import {action, LWMAction, LWMActionType} from '../table-action-button/lwm-actions'
import {mapUndefined} from '../utils/functions'

@Component({
    selector: 'lwm-abstract-header',
    templateUrl: './abstract-header.component.html',
    styleUrls: ['./abstract-header.component.scss']
})
export class AbstractHeaderComponent {

    @Input() headerTitle: string
    @Input() actionType: LWMActionType | undefined

    @Output() performAction: EventEmitter<void> = new EventEmitter()

    private action = (): LWMAction | undefined => mapUndefined(this.actionType, action)
}
