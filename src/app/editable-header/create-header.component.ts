import {Component, EventEmitter, Input, Output} from '@angular/core'

@Component({
    selector: 'lwm-create-header',
    templateUrl: './create-header.component.html',
    styleUrls: ['./create-header.component.scss']
})
export class CreateHeaderComponent {

    @Input() headerTitle: string
    @Input() canCreate: boolean

    @Output() create: EventEmitter<void> = new EventEmitter()
}
