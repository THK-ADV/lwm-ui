import {Component, Input} from '@angular/core'

export interface Card<Value, Entry> {
    value: Value
    entries: Entry[]
}

@Component({
    selector: 'lwm-card-list',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.scss']
})
export class CardListComponent<Value, Entry> {

    @Input() cards: Card<Value, Entry>[]
    @Input() canEdit: () => boolean
    @Input() onEdit: (card: Value) => void
    @Input() leftEntryLabel: (entry: Entry) => string
    @Input() rightEntryLabel: (entry: Entry) => string
    @Input() cardTitle: (card: Value) => string
}
