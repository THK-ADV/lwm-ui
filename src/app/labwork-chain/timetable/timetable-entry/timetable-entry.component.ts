import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {TableHeaderColumn} from '../../../abstract-crud/abstract-crud.component'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {Observable} from 'rxjs'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {FormInput, FormInputData} from '../../../shared-dialogs/forms/form.input'
import {User} from '../../../models/user.model'
import {FormInputOption} from '../../../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from '../../../utils/form.validator'
import {
    createAction,
    deleteAction,
    foreachOption,
    formatUser,
    getOptionErrorMessage,
    hasOptionError,
    isOption,
    LWMAction,
    resetControl
} from '../../../utils/component.utils'
import {map} from 'rxjs/operators'
import {exists} from '../../../utils/functions'
import {Room} from '../../../models/room.model'
import {Tuple} from '../../../utils/tuple'

@Component({
    selector: 'lwm-timetable-entry',
    templateUrl: './timetable-entry.component.html',
    styleUrls: ['./timetable-entry.component.scss']
})
export class TimetableEntryComponent implements OnInit, OnDestroy {

    protected readonly displayedColumns: string[]
    protected readonly columns: TableHeaderColumn[]
    private readonly headerTitle: string
    private readonly dataSource = new MatTableDataSource<User>()

    private readonly formGroup: FormGroup
    private readonly supervisorInput: FormInput
    private readonly roomInput: FormInput

    private readonly addAction: LWMAction
    private readonly deleteAction: LWMAction

    private possibleSupervisors$: Observable<User[]>
    private possibleRooms$: Observable<Room[]>

    constructor(
        private dialogRef: MatDialogRef<TimetableEntryComponent, Tuple<User[], Room>>,
        @Inject(MAT_DIALOG_DATA) private payload: {
            currentRoom: Room,
            allRooms$: Readonly<Observable<Room[]>>,
            currentSupervisors: User[],
            allCourseMembers$: Readonly<Observable<User[]>>
        }
    ) {
        this.headerTitle = 'Eintrag bearbeiten'
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

    static instance(
        dialog: MatDialog,
        currentRoom: Room,
        allRooms$: Readonly<Observable<Room[]>>,
        currentSupervisors: User[],
        allCourseMembers$: Readonly<Observable<User[]>>
    ): MatDialogRef<TimetableEntryComponent, Tuple<User[], Room>> {
        return dialog.open(TimetableEntryComponent, {
            data: {
                currentRoom: currentRoom,
                allRooms$: allRooms$,
                currentSupervisors: currentSupervisors,
                allCourseMembers$: allCourseMembers$
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
                rooms => rooms.find(r => r.id === this.payload.currentRoom.id)
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

    private hasOptionError_(formInputData: FormInputData<any>): boolean {
        return hasOptionError(formInputData)
    }

    private getOptionErrorMessage_(formInputData: FormInputData<any>): string {
        return getOptionErrorMessage(formInputData)
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

    private userFromControl = (): User => {
        return this.userFormControl().value as User
    }

    private roomFromControl = (): Room => {
        return this.roomFormControl().value as Room
    }

    private add = (supervisor: User) => {
        this.payload.currentSupervisors = this.payload.currentSupervisors.concat(supervisor)
        this.updateEverything()
    }

    private remove = (supervisor: User) => {
        this.payload.currentSupervisors = this.payload.currentSupervisors.filter(x => x.id !== supervisor.id)
        this.updateEverything()
    }

    private cancel = () => {
        this.dialogRef.close(undefined)
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
        if (this.formGroup.valid) {
            this.dialogRef.close({first: this.payload.currentSupervisors, second: this.roomFromControl()})
        } else {
            console.log('invalid form group')
        }
    }
}
