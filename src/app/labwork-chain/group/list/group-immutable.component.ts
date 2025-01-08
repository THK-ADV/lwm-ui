import {Component, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'

@Component({
    selector: 'lwm-group-immutable',
    templateUrl: './group-immutable.component.html',
    styleUrls: ['./group-immutable.component.scss'],
    standalone: false
})
export class GroupImmutableComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>

    headerTitle: string

    constructor() {
        this.scheduleEntries = []
    }

    ngOnInit() {
        console.log('group immutable component loaded')

        this.headerTitle = `Gruppen für ${this.labwork.label}`
    }
}
