import {Component, EventEmitter, Inject, OnDestroy, OnInit} from '@angular/core'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {GroupAtom} from '../../models/group.model'
import {Observable, Subscription} from 'rxjs'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {User} from '../../models/user.model'
import {AlertService} from '../../services/alert.service'
import {addToDataSource, removeFromDataSource} from '../../shared-dialogs/dataSource.update'
import {FormInputOption} from '../../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from '../../utils/form.validator'
import {exists, subscribe} from '../../utils/functions'
import {FormInput} from '../../shared-dialogs/forms/form.input'
import {GroupDeletionResult, GroupInsertionResult, GroupMovementResult, LwmService} from '../../services/lwm.service'
import {map, tap} from 'rxjs/operators'
import {createAction, deleteAction, LWMAction, swapAction} from '../../table-action-button/lwm-actions'
import {formatUser} from '../../utils/component.utils'
import {foreachOption, getOptionErrorMessage, hasOptionError, isOption, resetControl} from '../../utils/form-control-utils'

@Component({
    selector: 'lwm-group-edit',
    templateUrl: './group-edit.component.html',
    styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit, OnDestroy { // TODO apply assignment index changes

    private subs: Subscription[]
    private dataSource = new MatTableDataSource<User>()

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]

    private readonly addAction: LWMAction
    private readonly deleteAction: LWMAction
    private readonly swapAction: LWMAction

    private readonly addStudentFormGroup: FormGroup
    private readonly addStudentForm: FormInput

    readonly groupChanged: EventEmitter<void>

    private readonly hasOptionError_ = hasOptionError
    private readonly getOptionErrorMessage_ = getOptionErrorMessage

    static instance(
        dialog: MatDialog,
        selectedGroup: GroupAtom,
        allGroups: GroupAtom[],
        fellowStudents$: Observable<User[]>
    ): MatDialogRef<GroupEditComponent> {
        const otherGroups = allGroups.filter(g => g.id !== selectedGroup.id)
        fellowStudents$ = this.removeAllGroupMembers(allGroups, fellowStudents$)

        return dialog.open<GroupEditComponent>(GroupEditComponent, {
            data: {group: selectedGroup, otherGroups: otherGroups, fellowStudents$: fellowStudents$},
            panelClass: 'lwmGroupEditDialog'
        })
    }

    private static removeAllGroupMembers(allGroups: GroupAtom[], students$: Observable<User[]>) {
        const allStudentsInGroup = allGroups.flatMap(g => g.members)

        return students$.pipe(
            map(students => students.filter(s => !exists(allStudentsInGroup, x => x.id === s.id)))
        )
    }

    constructor(
        private readonly dialogRef: MatDialogRef<GroupEditComponent>,
        private readonly alertService: AlertService,
        private readonly dialog: MatDialog,
        private readonly service: LwmService,
        @Inject(MAT_DIALOG_DATA) private payload: { group: GroupAtom, otherGroups: GroupAtom[], fellowStudents$: Observable<User[]> }
    ) {
        this.groupChanged = new EventEmitter<void>()
        this.subs = []
        this.columns = [{attr: 'name', title: 'Name, Vorname'}, {attr: 'systemId', title: 'GMID'}]
        this.displayedColumns = this.columns.map(c => c.attr).concat('action')
        this.dataSource.data = payload.group.members
        this.deleteAction = deleteAction()
        this.swapAction = swapAction()
        this.addAction = createAction()

        this.addStudentFormGroup = new FormGroup({})

        const addStudentFcName = 'member'
        this.addStudentForm = {
            formControlName: addStudentFcName,
            displayTitle: 'Student hinzufügen',
            isDisabled: false,
            data: new FormInputOption<User>(addStudentFcName, invalidChoiceKey, true, formatUser, payload.fellowStudents$)
        }

        this.setupFormGroups()
    }

    private setupFormGroups() {
        this.addStudentFormGroup.addControl(
            this.addStudentForm.formControlName,
            new FormControl(this.addStudentForm.data.value, this.addStudentForm.data.validator)
        )
    }

    ngOnInit() {
        foreachOption([this.addStudentForm], o => o.onInit(this.addStudentFormGroup))
    }

    ngOnDestroy() {
        foreachOption([this.addStudentForm], o => o.onDestroy())
        this.onCancel()
    }

    private prepareTableContent = (user: User, attr: string): string => {
        switch (attr) {
            case 'name':
                return `${user.lastname}, ${user.firstname}`
            default:
                return user[attr]
        }
    }

    private userFormControl = (): AbstractControl => {
        return this.addStudentFormGroup.controls[this.addStudentForm.formControlName]
    }

    private userFromControl = (): User => {
        return this.userFormControl().value as User
    }

    private onCancel = () => {
        this.dialogRef.close()
    }

    private move = (member: User, dest: GroupAtom) => {
        const movementMsg = (result: GroupMovementResult): string => {
            const cardsUpdated = result.updatedReportCardEntries.length !== 0
            let msg = result.changedMembership ? `moved into group ${result.newMembership.group}` : 'failed to move into dest group'
            if (cardsUpdated) {
                msg += ` and updated ${result.updatedReportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const result$ = this.service.moveStudentToGroup(
            this.payload.group.labwork.course,
            {
                labwork: this.payload.group.labwork.id,
                student: member.id,
                srcGroup: this.payload.group.id,
                destGroup: dest.id
            }
        )

        const s = subscribe(result$, result => {
            removeFromDataSource(this.dataSource)(m => m.id === member.id)

            this.groupChanged.emit()
            this.alertService.reportAlert('success', movementMsg(result))
        })

        this.subs.push(s)
    }

    private delete = (member: User) => {
        const deletionMsg = (result: GroupDeletionResult): string => {
            const cardsCreated = result.reportCardEntries.length !== 0
            let msg = result.changedMembership ? 'removed group membership' : 'not removed group membership'
            msg += ` and application: ${JSON.stringify(result.labworkApplication)}`
            if (cardsCreated) {
                msg += ` and ${result.reportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const result$ = this.service.removeStudentFromGroup(
            this.payload.group.labwork.course,
            {
                labwork: this.payload.group.labwork.id,
                group: this.payload.group.id,
                student: member.id
            }
        )

        const s = subscribe(result$, result => {
            removeFromDataSource(this.dataSource)(m => m.id === member.id)

            this.updateStudentsByAdding(member)

            this.groupChanged.emit()
            this.alertService.reportAlert('success', deletionMsg(result))
        })

        this.subs.push(s)
    }

    private create = (member: User) => {
        const creationMsg = (result: GroupInsertionResult): string => {
            const cardsCreated = result.reportCardEntries.length !== 0
            let msg = `created group membership ${JSON.stringify(result.membership)}`
            if (cardsCreated) {
                msg += ` and ${result.reportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const result$ = this.service.insertStudentIntoGroup(
            this.payload.group.labwork.course,
            {
                labwork: this.payload.group.labwork.id,
                group: this.payload.group.id,
                student: member.id
            }
        )

        const s = subscribe(result$, result => {
            addToDataSource(this.dataSource)(member)
            resetControl(this.userFormControl())

            this.updateStudentsByRemoving(member)

            this.groupChanged.emit()
            this.alertService.reportAlert('success', creationMsg(result))
        })

        this.subs.push(s)
    }

    private updateStudentsByRemoving = (member: User) => {
        this.payload.fellowStudents$ = this.payload.fellowStudents$.pipe(
            map(xs => xs.filter(x => x.id !== member.id))
        )

        if (isOption(this.addStudentForm.data)) {
            this.addStudentForm.data.bindOptions(this.payload.fellowStudents$)
        }
    }

    private updateStudentsByAdding = (member: User) => {
        this.payload.fellowStudents$ = this.payload.fellowStudents$.pipe(
            tap(xs => xs.push(member))
        )

        if (isOption(this.addStudentForm.data)) {
            this.addStudentForm.data.bindOptions(this.payload.fellowStudents$)
        }
    }

    private shouldAllowSwapping = (): boolean => {
        return this.payload.otherGroups.length > 0
    }
}
