import {Component, EventEmitter, Input, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {Observable, Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {Blacklist, BlacklistProtocol} from '../../../models/blacklist.model'
import {
    createLocalBlacklistFromOutputData,
    localBlacklistCreationInputData,
    localBlacklistInputData,
    updateLocalBlacklistFromOutputData
} from '../../../blacklists/blacklist-view-model'
import {BlacklistService} from '../../../services/blacklist.service'
import {TimetableAtom} from '../../../models/timetable'
import {DeleteDialogComponent} from '../../../shared-dialogs/delete/delete-dialog.component'
import {
    addBlacklistToTimetable$,
    fullBlacklistLabel,
    removeBlacklistFromTimetable$,
    updateBlacklistInTimetable$
} from '../timetable-blacklists-view-model'
import {TimetableService} from '../../../services/timetable.service'
import {subscribe} from '../../../utils/functions'
import {FormPayload} from '../../../shared-dialogs/create-update/create-update-dialog.component'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../../shared-dialogs/dialog.mode'
import {openDialog, openDialogFromPayload} from '../../../shared-dialogs/dialog-open-combinator'
import {LWMActionType} from '../../../table-action-button/lwm-actions'

@Component({
    selector: 'lwm-timetable-blacklists-edit',
    templateUrl: './timetable-blacklists-edit.component.html',
    styleUrls: ['./timetable-blacklists-edit.component.scss']
})
export class TimetableBlacklistsEditComponent {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
    @Input() hasPermission: Readonly<boolean>

    @Output() timetableUpdate: EventEmitter<TimetableAtom>

    private readonly subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly blacklistService: BlacklistService,
        private readonly timetableService: TimetableService
    ) {
        this.timetableUpdate = new EventEmitter<TimetableAtom>()
        this.subs = []
    }

    private updateDataSource = (t: TimetableAtom) => {
        console.log('updating blacklist entries')

        this.timetable = t
        this.timetableUpdate.emit(t)
    }

    private updateDataSource$ = (ot: Observable<TimetableAtom>) => {
        this.subs.push(subscribe(ot, this.updateDataSource))
    }

    canCreate = (): LWMActionType | undefined => {
        return this.hasPermission ? 'create' : undefined
    }

    onCreate = () => {
        const mode = DialogMode.create
        const payload: FormPayload<BlacklistProtocol> = {
            headerTitle: dialogTitle(mode, 'Lokale Blacklist'),
            submitTitle: dialogSubmitTitle(mode),
            data: localBlacklistCreationInputData(`${this.labwork.label}, ${this.labwork.semester.abbreviation}`),
            makeProtocol: createLocalBlacklistFromOutputData  // TODO maybe we should merge withCreateProtocol with makeProtocol and give the user the chance to catch up with disabled updates. since they are always used together. don't they?
        }

        this.updateDataSource$(
            openDialogFromPayload(
                this.dialog,
                payload,
                addBlacklistToTimetable$(this.timetableService, this.blacklistService, this.timetable) // TODO this should be handled by the backend (see delete)
            )
        )
    }

    onEdit = (blacklist: Blacklist) => {
        const mode = DialogMode.edit
        const payload: FormPayload<BlacklistProtocol> = {
            headerTitle: dialogTitle(mode, 'Lokale Blacklist'),
            submitTitle: dialogSubmitTitle(mode),
            data: localBlacklistInputData(blacklist, true),
            makeProtocol: updateLocalBlacklistFromOutputData(blacklist) // TODO maybe we should merge withCreateProtocol with makeProtocol and give the user the chance to catch up with disabled updates. since they are always used together. don't they?
        }

        this.updateDataSource$(
            openDialogFromPayload(
                this.dialog,
                payload,
                updateBlacklistInTimetable$(this.blacklistService, this.timetable, blacklist.id)
            )
        )
    }

    onDelete = (blacklist: Blacklist) => {
        const deleteRef = DeleteDialogComponent.instance(
            this.dialog,
            {label: fullBlacklistLabel(blacklist), id: blacklist.id}
        )

        this.updateDataSource$(
            openDialog(
                deleteRef,
                removeBlacklistFromTimetable$(this.timetableService, this.timetable)
            )
        )
    }
}
