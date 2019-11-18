import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'
import {MatTableDataSource} from '@angular/material'
import {Blacklist} from '../../models/blacklist.model'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {deleteAction, editAction, LWMAction, LWMActionType} from '../../table-action-button/lwm-actions'
import {formatBlacklistTableEntry, localBlacklistsColumns} from '../../blacklists/blacklist-view-model'
import {dateOrderingASC, foldUndefined} from '../../utils/functions'

@Component({
    selector: 'lwm-abstract-blacklist-timetable-view',
    templateUrl: './abstract-blacklist-timetable-view.component.html',
    styleUrls: ['./abstract-blacklist-timetable-view.component.scss']
})
export class AbstractBlacklistTimetableViewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() canCreate: LWMActionType | undefined
    @Input() canEdit: boolean
    @Input() canDelete: boolean

    @Input() set timetable(t: Readonly<TimetableAtom>) {
        this.dataSource.data = t.localBlacklist
            .sort((lhs, rhs) => dateOrderingASC(lhs.date, rhs.date))
    }

    @Output() createEmitter: EventEmitter<void>
    @Output() deleteEmitter: EventEmitter<Blacklist>
    @Output() updateEmitter: EventEmitter<Blacklist>

    private headerTitle: string
    private dataSource = new MatTableDataSource<Blacklist>()

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]
    private readonly actions: LWMAction[]
    private readonly prepareTableContent = formatBlacklistTableEntry // TODO apply this pattern everywhere

    constructor() {
        this.createEmitter = new EventEmitter<void>()
        this.deleteEmitter = new EventEmitter<Blacklist>()
        this.updateEmitter = new EventEmitter<Blacklist>()

        this.columns = localBlacklistsColumns()
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
        this.actions = []
    }

    ngOnInit() {
        console.log('timetable blacklist component loaded')
        this.headerTitle = `${this.canEdit ? 'Bearbeitung geblockter' : 'Geblockte'}  Tage für ${this.labwork.label}`

        // TODO permission
        if (this.canEdit) {
            this.actions.push(editAction())
        }

        if (this.canDelete) {
            this.actions.push(deleteAction())
        }
    }

    private canCreateF = () => foldUndefined(this.canCreate, x => [x], () => [])

    private onCreate = () => this.createEmitter.emit()

    private onSelect = (blacklist: Blacklist) => {
        if (this.canEdit) {
            this.updateEmitter.emit(blacklist)
        }
    }

    private performAction = (action: LWMActionType, blacklist: Blacklist) => {
        switch (action) {
            case 'edit':
                this.updateEmitter.emit(blacklist)
                break
            case 'delete':
                this.deleteEmitter.emit(blacklist)
                break
            default:
                break
        }
    }
}
