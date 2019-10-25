import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {AssignmentEntry} from '../../../models/assignment-plan.model'
import {Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {AssignmentEntriesService} from '../../../services/assignment-entries.service'
import {DialogMode} from '../../../shared-dialogs/dialog.mode'
import {LWMActionType} from '../../../table-action-button/lwm-actions'
import {
    assignmentEntryFormPayload,
    assignmentEntryProtocol,
    createAssignmentEntry$,
    deleteAndFetchAssignmentEntry$,
    updateAssignmentEntry$
} from './assignment-entry-view-model'
import {compose, subscribe} from '../../../utils/functions'
import {openDialog, openDialogFromPayload} from '../../../shared-dialogs/dialog-open-combinator'
import {DeleteDialogComponent} from '../../../shared-dialogs/delete/delete-dialog.component'

@Component({
    selector: 'lwm-assignment-plan-edit',
    templateUrl: './assignment-plan-edit.component.html',
    styleUrls: ['./assignment-plan-edit.component.scss']
})
export class AssignmentPlanEditComponent implements OnDestroy {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() assignmentEntries: Readonly<AssignmentEntry[]>
    @Input() hasPermission: Readonly<boolean>

    @Output() assignmentEntriesUpdate: EventEmitter<Readonly<AssignmentEntry[]>>

    private subs: Subscription[]

    constructor(
        private readonly assignmentPlanService: AssignmentEntriesService,
        private readonly dialog: MatDialog
    ) {
        this.assignmentEntriesUpdate = new EventEmitter<Readonly<AssignmentEntry[]>>()
        this.subs = []
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private emit = (xs: Readonly<AssignmentEntry[]>) => this.assignmentEntriesUpdate.emit(xs)

    private onCreate = () => {
        const protocol = assignmentEntryProtocol(this.labwork.id)
        const payload = assignmentEntryFormPayload(DialogMode.create, protocol, this.nextAssignmentIndex())
        const create$ = createAssignmentEntry$(this.labwork.course.id, this.assignmentPlanService)
        const mergeEntries = (e: Readonly<AssignmentEntry>) => this.assignmentEntries.concat(e)
        const sub = subscribe(openDialogFromPayload(this.dialog, payload, create$), compose(mergeEntries, this.emit))

        this.subs.push(sub)
    }

    private onEdit = (entry: AssignmentEntry) => {
        const payload = assignmentEntryFormPayload(DialogMode.edit, {...entry}, entry.index)
        const update$ = updateAssignmentEntry$(this.labwork.course.id, this.assignmentPlanService)
        const updateEntries = (e: Readonly<AssignmentEntry>) => this.assignmentEntries.map(x => x.id === e.id ? e : x)
        const sub = subscribe(openDialogFromPayload(this.dialog, payload, update$), compose(updateEntries, this.emit))

        this.subs.push(sub)
    }

    private onDelete = (entry: AssignmentEntry) => {
        const dialogData = {label: `Termin ${entry.index + 1}. ${entry.label}`, id: entry.id}
        const dialogRef = DeleteDialogComponent.instance(this.dialog, dialogData)
        const delete$ = deleteAndFetchAssignmentEntry$(this.labwork, this.assignmentPlanService)
        const sub = subscribe(openDialog(dialogRef, delete$), this.emit)

        this.subs.push(sub)
    }

    private canCreate = (): LWMActionType | undefined => {
        return this.hasPermission ? 'create' : undefined
    }

    private nextAssignmentIndex = (): number => this.assignmentEntries.length
}
