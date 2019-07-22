import {Component, EventEmitter, Input, Output} from '@angular/core'

export enum ListTemplateEvent {
    createButtonClicked
}

@Component({
    selector: 'app-list-template',
    templateUrl: './list-template.component.html',
    styleUrls: ['./list-template.component.scss']
})
export class ListTemplateComponent {

    @Input() headerTitle: string
    @Output() emitter: EventEmitter<ListTemplateEvent> = new EventEmitter()

    onCreate() {
        console.log('onCreate')
        this.emitter.emit(ListTemplateEvent.createButtonClicked)
    }
}
