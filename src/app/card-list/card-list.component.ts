import {Component, EventEmitter, Input, Output} from '@angular/core'

export interface Card<Value, Entry> {
    value: Value
    entries: Entry[]
}

@Component({
    selector: 'lwm-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss'],
    standalone: false
})
export class CardListComponent<Value, Entry> {

    @Input() cards: Card<Value, Entry>[] = []
    @Input() canEdit: () => boolean = () => false
    @Input() onEdit: (card: Value) => void = _ => {}
    @Input() leftEntryLabel: (entry: Entry) => string = _ => ''
    @Input() rightEntryLabel: (entry: Entry) => string = _ => ''
    @Input() cardTitle: (card: Value) => string = _ => ''

    @Output() onEntryClick = new EventEmitter<Entry>()
}
