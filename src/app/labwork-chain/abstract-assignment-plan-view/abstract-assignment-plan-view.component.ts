import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {AssignmentEntry, sortedAssignmentPlanEntryTypes} from '../../models/assignment-plan.model'
import {MatTableDataSource} from '@angular/material'
import {LWMActionType} from '../../table-action-button/lwm-actions'
import {foldUndefined} from '../../utils/functions'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'

@Component({
    selector: 'lwm-abstract-assignment-plan-view',
    templateUrl: './abstract-assignment-plan-view.component.html',
    styleUrls: ['./abstract-assignment-plan-view.component.scss']
})
export class AbstractAssignmentPlanViewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() canCreate: LWMActionType | undefined
    @Input() canDelete: boolean
    @Input() canEdit: boolean

    @Input() set assignmentEntries(xs: Readonly<AssignmentEntry[]>) {
        this.dataSource.data = [...xs].sort((lhs, rhs) => lhs.index - rhs.index)
    }

    @Output() createEmitter: EventEmitter<void>
    @Output() deleteEmitter: EventEmitter<AssignmentEntry>
    @Output() updateEmitter: EventEmitter<AssignmentEntry>

    headerTitle: String
    dataSource = new MatTableDataSource<AssignmentEntry>()

    readonly displayedColumns: string[]
    readonly columns: TableHeaderColumn[]

    constructor() {
        this.columns = [
            {title: 'Termin', attr: 'index'},
            {title: 'Bezeichnung', attr: 'label'},
            {title: 'Abnahmearten', attr: 'entryTypes'},
            {title: 'Folgetermin', attr: 'duration'},
        ]

        this.createEmitter = new EventEmitter<void>()
        this.deleteEmitter = new EventEmitter<AssignmentEntry>()
        this.updateEmitter = new EventEmitter<AssignmentEntry>()
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
    }

    ngOnInit() {
        console.log('plan component loaded')

        this.headerTitle = `${this.canEdit ? 'Ablaufplanbearbeitung' : 'Ablaufplan'} für ${this.labwork.label}`
    }

    canCreateF = (): LWMActionType[] => foldUndefined(this.canCreate, x => [x], () => [])

    displayedEntryTypes = (entry: AssignmentEntry): string[] => {
        return sortedAssignmentPlanEntryTypes(entry).types.map(t => t.entryType)
    }

    onSelect = (entry: AssignmentEntry) => {
        if (this.canEdit) {
            this.updateEmitter.emit(entry)
        }
    }

    onDelete = (entry: AssignmentEntry) => {
        this.deleteEmitter.emit(entry)
    }

    onEdit = (entry: AssignmentEntry) => {
        this.updateEmitter.emit(entry)
    }

    onCreate = () => {
        this.createEmitter.emit()
    }
}
