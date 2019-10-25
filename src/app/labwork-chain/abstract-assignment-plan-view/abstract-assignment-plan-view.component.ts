import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {AssignmentEntry, sortedAssignmentPlanEntryTypes} from '../../models/assignment-plan.model'
import {MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {LWMActionType} from '../../table-action-button/lwm-actions'
import {foldUndefined} from '../../utils/functions'

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

    private headerTitle: String
    private dataSource = new MatTableDataSource<AssignmentEntry>()

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]

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

    private canCreateF = (): LWMActionType[] => foldUndefined(this.canCreate, x => [x], () => [])

    private displayedEntryTypes = (entry: AssignmentEntry): string[] => {
        return sortedAssignmentPlanEntryTypes(entry).types.map(t => t.entryType)
    }

    private onSelect = (entry: AssignmentEntry) => {
        if (this.canEdit) {
            this.updateEmitter.emit(entry)
        }
    }

    private onDelete = (entry: AssignmentEntry) => {
        this.deleteEmitter.emit(entry)
    }

    private onEdit = (entry: AssignmentEntry) => {
        this.updateEmitter.emit(entry)
    }

    private onCreate = () => {
        this.createEmitter.emit()
    }
}
