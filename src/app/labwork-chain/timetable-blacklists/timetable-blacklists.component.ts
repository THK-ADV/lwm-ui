import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {Observable, Subscription} from 'rxjs'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {Blacklist, BlacklistProtocol} from '../../models/blacklist.model'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {
    createLocalBlacklistFromOutputData,
    formatBlacklistTableEntry,
    localBlacklistCreationInputData,
    localBlacklistInputData,
    localBlacklistsColumns,
    updateLocalBlacklistFromOutputData
} from '../../blacklists/blacklist-view-model'
import {deleteAction, editAction, LWMAction, LWMActionType} from '../../table-action-button/lwm-actions'
import {BlacklistService} from '../../services/blacklist.service'
import {TimetableAtom} from '../../models/timetable'
import {DeleteDialogComponent} from '../../shared-dialogs/delete/delete-dialog.component'
import {
    addBlacklistToTimetable$,
    fullBlacklistLabel,
    removeBlacklistFromTimetable$,
    updateBlacklistInTimetable$
} from './timetable-blacklists-view-model'
import {TimetableService} from '../../services/timetable.service'
import {subscribe} from '../../utils/functions'
import {FormPayload} from '../../shared-dialogs/create-update/create-update-dialog.component'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../shared-dialogs/dialog.mode'
import {openDialog, openDialogFromPayload} from '../../shared-dialogs/dialog-open-combinator'

@Component({
    selector: 'lwm-timetable-blacklists',
    templateUrl: './timetable-blacklists.component.html',
    styleUrls: ['./timetable-blacklists.component.scss']
})
export class TimetableBlacklistsComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
    @Output() timetableUpdate: EventEmitter<TimetableAtom>

    private headerTitle: string
    private subs: Subscription[]
    private dataSource = new MatTableDataSource<Blacklist>()

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]
    private readonly actions: LWMAction[]
    private readonly prepareTableContent = formatBlacklistTableEntry // TODO apply this pattern everywhere

    constructor(
        private readonly dialog: MatDialog,
        private readonly blacklistService: BlacklistService,
        private readonly timetableService: TimetableService
    ) {
        this.timetableUpdate = new EventEmitter<TimetableAtom>()
        this.columns = localBlacklistsColumns()
        this.subs = []
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
        this.actions = [editAction(), deleteAction()] // TODO permission
    }

    ngOnInit() { // TODO pre fill with global blacklists for current semester
        this.headerTitle = `Geblockte Tage für ${this.labwork.label}`
        this.updateDataSource(this.timetable)
    }

    private updateDataSource = (t: TimetableAtom) => {
        console.log('updating blacklist entries')

        this.timetable = t
        this.timetableUpdate.emit(t)

        this.dataSource.data = t.localBlacklist
            .sort((lhs, rhs) => lhs.date.getTime() - rhs.date.getTime())
    }

    private updateDataSource$ = (ot: Observable<TimetableAtom>) => {
        this.subs.push(subscribe(ot, this.updateDataSource))
    }

    private canCreate = () => {
        return true // TODO permission check
    }

    private performAction = (action: LWMActionType, blacklist: Blacklist) => {
        switch (action) {
            case 'edit':
                this.onEdit(blacklist)
                break
            case 'delete':
                this.onDelete(blacklist)
                break
            default:
                break
        }
    }

    private onCreate = () => {
        const mode = DialogMode.create
        const payload: FormPayload<BlacklistProtocol> = {
            headerTitle: dialogTitle(mode, 'Lokale Blacklist'),
            submitTitle: dialogSubmitTitle(mode),
            data: localBlacklistCreationInputData(`${this.labwork.label}, ${this.labwork.semester.abbreviation}`),
            makeProtocol: createLocalBlacklistFromOutputData
        }

        this.updateDataSource$(
            openDialogFromPayload(
                this.dialog,
                payload,
                addBlacklistToTimetable$(this.timetableService, this.blacklistService, this.timetable)
            )
        )
    }

    private onEdit = (blacklist: Blacklist) => {
        const mode = DialogMode.edit
        const payload: FormPayload<BlacklistProtocol> = {
            headerTitle: dialogTitle(mode, 'Lokale Blacklist'),
            submitTitle: dialogSubmitTitle(mode),
            data: localBlacklistInputData(blacklist, true),
            makeProtocol: updateLocalBlacklistFromOutputData(blacklist)
        }

        this.updateDataSource$(
            openDialogFromPayload(
                this.dialog,
                payload,
                updateBlacklistInTimetable$(this.blacklistService, this.timetable, blacklist.id)
            )
        )
    }

    private onDelete = (blacklist: Blacklist) => {
        // TODO delete on global blacklists removes n:m relationship x
        // TODO delete on local blacklists removes both ✓
        // TODO maybe this should be handled by the backend

        const deleteRef = DeleteDialogComponent.instance(
            this.dialog,
            {label: fullBlacklistLabel(blacklist), id: blacklist.id}
        )

        this.updateDataSource$(
            openDialog(
                deleteRef,
                removeBlacklistFromTimetable$(this.timetableService, this.blacklistService, this.timetable)
            )
        )
    }
}
