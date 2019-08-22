import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {GroupAtom} from '../../models/group.model'
import {Observable, Subscription} from 'rxjs'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {User} from '../../models/user.model'
import {
    createAction,
    deleteAction,
    foreachOption,
    formatUser,
    getOptionErrorMessage,
    hasOptionError,
    LWMAction,
    resetControl,
    swapAction
} from '../../utils/component.utils'
import {AlertService} from '../../services/alert.service'
import {addToDataSource, removeFromDataSource} from '../../shared-dialogs/dataSource.update'
import {FormInputOption} from '../../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from '../../utils/form.validator'
import {subscribe} from '../../utils/functions'
import {FormInput, FormInputData} from '../../shared-dialogs/forms/form.input'

@Component({
    selector: 'lwm-group-edit',
    templateUrl: './group-edit.component.html',
    styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit, OnDestroy {

    private subs: Subscription[]
    private dataSource = new MatTableDataSource<User>()

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]

    private readonly addAction: LWMAction
    private readonly deleteAction: LWMAction
    private readonly swapAction: LWMAction

    private readonly addStudentFormGroup: FormGroup
    private readonly addStudentForm: FormInput

    static instance(
        dialog: MatDialog,
        selectedGroup: GroupAtom,
        allGroups: GroupAtom[],
        fellowStudents$: Observable<User[]>
    ): MatDialogRef<GroupEditComponent> {
        const otherGroups = allGroups.filter(g => g.id !== selectedGroup.id)
        return dialog.open<GroupEditComponent>(GroupEditComponent, {
            data: {group: selectedGroup, otherGroups: otherGroups, fellowStudents$: fellowStudents$},
            panelClass: 'lwmGroupEditDialog'
        })
    }

    constructor(
        private readonly dialogRef: MatDialogRef<GroupEditComponent>,
        private readonly alertService: AlertService,
        private readonly dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) private payload: { group: GroupAtom, otherGroups: GroupAtom[], fellowStudents$: Observable<User[]> }
    ) {
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
            data: new FormInputOption<User>(
                '',
                addStudentFcName,
                invalidChoiceKey,
                true,
                formatUser,
                options => subscribe(this.payload.fellowStudents$, options)
            )
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
    }

    hasOptionError_(formInputData: FormInputData<any>): boolean {
        return hasOptionError(formInputData)
    }

    getOptionErrorMessage_(formInputData: FormInputData<any>): string {
        return getOptionErrorMessage(formInputData)
    }

    prepareTableContent(user: User, attr: string): string {
        switch (attr) {
            case 'name':
                return `${user.lastname}, ${user.firstname}`
            default:
                return user[attr]
        }
    }

    private userFormControl(): AbstractControl {
        return this.addStudentFormGroup.controls[this.addStudentForm.formControlName]
    }

    private userFromControl(): User {
        return this.userFormControl().value as User
    }

    private onCancel() {
        this.dialogRef.close()
    }

    private swap(member: User, dest: GroupAtom) {
        // TODO perform actual swap
        // TODO emit change to previous component
        this.delete(member)
    }

    private delete(member: User) {
        // TODO remove from DS only after request
        // TODO emit change to previous component
        removeFromDataSource(this.alertService, this.dataSource)(member, (lhs, rhs) => lhs.id === rhs.id)
    }

    private create(member: User) {
        // TODO add to DS only after request
        // TODO emit change to previous component
        addToDataSource(this.alertService, this.dataSource)([member])
        resetControl(this.userFormControl())
    }

    private shouldAllowSwapping(): boolean {
        return this.payload.otherGroups.length > 0
    }
}
