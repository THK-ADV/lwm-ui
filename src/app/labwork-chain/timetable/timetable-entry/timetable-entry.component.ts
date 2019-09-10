import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {TableHeaderColumn} from '../../../abstract-crud/abstract-crud.component'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {Observable} from 'rxjs'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {FormInput} from '../../../shared-dialogs/forms/form.input'
import {User} from '../../../models/user.model'
import {FormInputOption} from '../../../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from '../../../utils/form.validator'
import {formatUser} from '../../../utils/component.utils'
import {map} from 'rxjs/operators'
import {exists, foldUndefined} from '../../../utils/functions'
import {Room} from '../../../models/room.model'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../../shared-dialogs/dialog.mode'
import {isRoom, isUser} from '../../../utils/type.check.utils'
import {createAction, deleteAction, LWMAction} from '../../../table-action-button/lwm-actions'
import {foreachOption, getOptionErrorMessage, hasOptionError, isOption, resetControl} from '../../../utils/form-control-utils'

export interface Delete {
    readonly kind: 'delete'
}

export interface Cancel {
    readonly kind: 'cancel'
}

export interface Update {
    readonly kind: 'update'
    readonly supervisors: User[]
    readonly room: Room
}

export type TimetableEntryDialogResult = Delete | Cancel | Update

@Component({
    selector: 'lwm-timetable-entry',
    templateUrl: './timetable-entry.component.html',
    styleUrls: ['./timetable-entry.component.scss']
})
export class TimetableEntryComponent implements OnInit, OnDestroy {

    constructor(
        private dialogRef: MatDialogRef<TimetableEntryComponent, TimetableEntryDialogResult>,
        @Inject(MAT_DIALOG_DATA) private payload: {
            currentRoom?: Room,
            allRooms$: Readonly<Observable<Room[]>>,
            currentSupervisors: User[],
            allCourseMembers$: Readonly<Observable<User[]>>,
            mode: DialogMode
        }
    ) {
        this.headerTitle = dialogTitle(payload.mode, 'Eintrag')
        this.submitTitle = dialogSubmitTitle(payload.mode)
        this.deleteTitle = 'Entfernen'
        this.columns = [{attr: 'name', title: 'Name, Vorname'}, {attr: 'systemId', title: 'GMID'}]
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
        this.dataSource.data = payload.currentSupervisors

        this.addAction = createAction()
        this.deleteAction = deleteAction()

        this.calcPossibleSupervisors()
        this.calcPossibleRooms()

        this.formGroup = new FormGroup({})
        this.supervisorInput = this.createAndAddSupervisorInput()
        this.roomInput = this.createAndAddRoomInput()
    }

    protected readonly displayedColumns: string[]
    protected readonly columns: TableHeaderColumn[]
    private readonly headerTitle: string
    private readonly submitTitle: string
    private readonly deleteTitle: string
    private readonly dataSource = new MatTableDataSource<User>()

    private readonly formGroup: FormGroup
    private readonly supervisorInput: FormInput
    private readonly roomInput: FormInput

    private readonly addAction: LWMAction
    private readonly deleteAction: LWMAction

    private possibleSupervisors$: Observable<User[]>
    private possibleRooms$: Observable<Room[]>

    private readonly hasOptionError_ = hasOptionError
    private readonly getOptionErrorMessage_ = getOptionErrorMessage

    static instance(
        dialog: MatDialog,
        mode: DialogMode,
        allRooms$: Readonly<Observable<Room[]>>,
        currentSupervisors: User[],
        allCourseMembers$: Readonly<Observable<User[]>>,
        currentRoom?: Room
    ): MatDialogRef<TimetableEntryComponent, TimetableEntryDialogResult> {
        return dialog.open(TimetableEntryComponent, {
            data: {
                currentRoom: currentRoom,
                allRooms$: allRooms$,
                currentSupervisors: currentSupervisors,
                allCourseMembers$: allCourseMembers$,
                mode: mode
            },
            panelClass: 'lwmTimetableEntryDialog'
        })
    }

    private createAndAddSupervisorInput = (): FormInput => {
        const fcName = 'supervisor'
        const supervisorInput = {
            formControlName: fcName,
            displayTitle: 'Mitarbeiter',
            isDisabled: false,
            data: new FormInputOption<User>(fcName, invalidChoiceKey, false, formatUser, this.possibleSupervisors$)
        }

        this.formGroup.addControl(
            supervisorInput.formControlName,
            new FormControl(supervisorInput.data.value, supervisorInput.data.validator)
        )

        return supervisorInput
    }

    private createAndAddRoomInput = (): FormInput => {
        const fcName = 'room'
        const roomInput = {
            formControlName: fcName,
            displayTitle: 'Raum',
            isDisabled: false,
            data: new FormInputOption<Room>(
                fcName,
                invalidChoiceKey,
                true,
                r => r.label,
                this.possibleRooms$,
                rooms => foldUndefined(
                    this.payload.currentRoom,
                    c => rooms.find(r => r.id === c.id),
                    () => undefined
                )
            )
        }

        this.formGroup.addControl(
            roomInput.formControlName,
            new FormControl(roomInput.data.value, roomInput.data.validator)
        )

        return roomInput
    }

    private calcPossibleSupervisors = () => {
        this.possibleSupervisors$ = this.payload.allCourseMembers$.pipe(
            map(xs => xs.filter(x => !exists(this.payload.currentSupervisors, u => u.id === x.id)))
        )
    }

    private calcPossibleRooms = () => {
        this.possibleRooms$ = this.payload.allRooms$
    }

    private inputs = (): FormInput[] => {
        return [this.supervisorInput, this.roomInput]
    }

    ngOnInit() {
        foreachOption(this.inputs(), i => i.onInit(this.formGroup))
    }

    ngOnDestroy() {
        foreachOption(this.inputs(), i => i.onDestroy())
    }

    private prepareTableContent = (user: User, attr: string): string => {
        switch (attr) {
            case 'name':
                return `${user.lastname}, ${user.firstname}`
            default:
                return user[attr]
        }
    }

    private userIsEmpty = (): boolean => {
        return typeof this.userFormControl().value === 'string' && this.userFormControl().value === ''
    }

    private userFormControl = (): AbstractControl => {
        return this.formGroup.controls[this.supervisorInput.formControlName]
    }

    private roomFormControl = (): AbstractControl => {
        return this.formGroup.controls[this.roomInput.formControlName]
    }

    private validUserInControl = (): boolean => {
        return isUser(this.userFormControl().value)
    }

    private add = () => {
        const supervisor = this.userFormControl().value

        if (!isUser(supervisor)) {
            return
        }

        this.payload.currentSupervisors = this.payload.currentSupervisors.concat(supervisor)
        this.updateEverything()
    }

    private remove = (supervisor: User) => {
        this.payload.currentSupervisors = this.payload.currentSupervisors.filter(x => x.id !== supervisor.id)
        this.updateEverything()
    }

    private cancel = () => {
        this.dialogRef.close({kind: 'cancel'})
    }

    private updateDataSource = () => this.dataSource.data = this.payload.currentSupervisors

    private updateSupervisorInput = () => {
        if (isOption(this.supervisorInput.data)) {
            this.supervisorInput.data.bindOptions(this.possibleSupervisors$)
        }
    }

    private updateEverything = () => {
        resetControl(this.userFormControl())
        this.updateDataSource()
        this.calcPossibleSupervisors()
        this.updateSupervisorInput()
    }

    private submit = () => {
        const room = this.roomFormControl().value

        if (this.formGroup.valid && isRoom(room)) {
            this.dialogRef.close({kind: 'update', room: room, supervisors: this.payload.currentSupervisors})
        } else {
            console.log('invalid form group')
        }
    }

    private canDelete = () => this.payload.mode === DialogMode.edit

    private delete = () => {
        this.dialogRef.close({kind: 'delete'})
    }
}
