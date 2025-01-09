import { Component, Inject, OnDestroy, OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog"
import { Observable } from "rxjs"
import { AbstractControl, FormControl, FormGroup } from "@angular/forms"
import { FormInput } from "../../../shared-dialogs/forms/form.input"
import { User } from "../../../models/user.model"
import { FormInputOption } from "../../../shared-dialogs/forms/form.input.option"
import { invalidChoiceKey } from "../../../utils/form.validator"
import { formatUser } from "../../../utils/component.utils"
import { map } from "rxjs/operators"
import { exists, foldUndefined } from "../../../utils/functions"
import { Room } from "../../../models/room.model"
import {
  DialogMode,
  dialogSubmitTitle,
  dialogTitle,
} from "../../../shared-dialogs/dialog.mode"
import { isRoom, isUser } from "../../../utils/type.check.utils"
import {
  createAction,
  deleteAction,
  LWMAction,
} from "../../../table-action-button/lwm-actions"
import {
  foreachOption,
  isOption,
  resetControl,
} from "../../../utils/form-control-utils"
import { TableHeaderColumn } from "../../../abstract-crud/abstract-crud.component"

export interface Delete {
  readonly kind: "delete"
}

export interface Cancel {
  readonly kind: "cancel"
}

export interface Update {
  readonly kind: "update"
  readonly supervisors: User[]
  readonly room: Room
}

export type TimetableEntryDialogResult = Delete | Cancel | Update

@Component({
  selector: "lwm-timetable-entry",
  templateUrl: "./timetable-entry.component.html",
  styleUrls: ["./timetable-entry.component.scss"],
  standalone: false,
})
export class TimetableEntryComponent implements OnInit, OnDestroy {
  constructor(
    private dialogRef: MatDialogRef<
      TimetableEntryComponent,
      TimetableEntryDialogResult
    >,
    @Inject(MAT_DIALOG_DATA)
    public payload: {
      currentRoom?: Room
      allRooms$: Readonly<Observable<Room[]>>
      currentSupervisors: User[]
      allCourseMembers$: Readonly<Observable<User[]>>
      mode: DialogMode
    },
  ) {
    this.headerTitle = dialogTitle(payload.mode, "Eintrag")
    this.submitTitle = dialogSubmitTitle(payload.mode)
    this.deleteTitle = "Entfernen"
    this.columns = [
      { attr: "name", title: "Name, Vorname" },
      { attr: "systemId", title: "GMID" },
    ]
    this.displayedColumns = this.columns.map((c) => c.attr).concat("action") // TODO add permission check
    this.dataSource.data = payload.currentSupervisors

    this.addAction = createAction()
    this.deleteAction = deleteAction()

    this.calcPossibleSupervisors()
    this.calcPossibleRooms()

    this.formGroup = new FormGroup({})

    const [supervisorInput, supervisorInputOption] =
      this.createAndAddSupervisorInput()
    this.supervisorInput = supervisorInput
    this.supervisorInputOption = supervisorInputOption

    const [roomInput, roomInputOption] = this.createAndAddRoomInput()
    this.roomInput = roomInput
    this.roomInputOption = roomInputOption
  }

  readonly displayedColumns: string[]
  readonly columns: TableHeaderColumn[]
  readonly headerTitle: string
  readonly submitTitle: string
  readonly deleteTitle: string
  readonly dataSource = new MatTableDataSource<User>()

  readonly formGroup: FormGroup
  readonly supervisorInput: FormInput
  supervisorInputOption: FormInputOption<User>
  readonly roomInput: FormInput
  readonly roomInputOption: FormInputOption<Room>

  readonly addAction: LWMAction
  readonly deleteAction: LWMAction

  possibleSupervisors$: Observable<User[]>
  possibleRooms$: Observable<Room[]>

  static instance(
    dialog: MatDialog,
    mode: DialogMode,
    allRooms$: Readonly<Observable<Room[]>>,
    currentSupervisors: User[],
    allCourseMembers$: Readonly<Observable<User[]>>,
    currentRoom?: Room,
  ): MatDialogRef<TimetableEntryComponent, TimetableEntryDialogResult> {
    return dialog.open(TimetableEntryComponent, {
      data: {
        currentRoom: currentRoom,
        allRooms$: allRooms$,
        currentSupervisors: currentSupervisors,
        allCourseMembers$: allCourseMembers$,
        mode: mode,
      },
      panelClass: "lwmTimetableEntryDialog",
    })
  }

  private createAndAddSupervisorInput = (): [
    FormInput,
    FormInputOption<User>,
  ] => {
    const fcName = "supervisor"
    const supervisorInputOption = new FormInputOption<User>(
      fcName,
      invalidChoiceKey,
      false,
      formatUser,
      this.possibleSupervisors$,
    )
    const supervisorInput = {
      formControlName: fcName,
      displayTitle: "Mitarbeiter",
      isDisabled: false,
      data: supervisorInputOption,
    }

    this.formGroup.addControl(
      supervisorInput.formControlName,
      new FormControl(
        supervisorInput.data.value,
        supervisorInput.data.validator,
      ),
    )

    return [supervisorInput, supervisorInputOption]
  }

  private createAndAddRoomInput = (): [FormInput, FormInputOption<Room>] => {
    const fcName = "room"
    const roomInputOption = new FormInputOption<Room>(
      fcName,
      invalidChoiceKey,
      true,
      (r) => r.label,
      this.possibleRooms$,
      undefined,
      (rooms) =>
        foldUndefined(
          this.payload.currentRoom,
          (c) => rooms.find((r) => r.id === c.id),
          () => undefined,
        ),
    )
    const roomInput = {
      formControlName: fcName,
      displayTitle: "Raum",
      isDisabled: false,
      data: roomInputOption,
    }

    this.formGroup.addControl(
      roomInput.formControlName,
      new FormControl(roomInput.data.value, roomInput.data.validator),
    )

    return [roomInput, roomInputOption]
  }

  private calcPossibleSupervisors = () => {
    this.possibleSupervisors$ = this.payload.allCourseMembers$.pipe(
      map((xs) =>
        xs.filter(
          (x) => !exists(this.payload.currentSupervisors, (u) => u.id === x.id),
        ),
      ),
    )
  }

  private calcPossibleRooms = () => {
    this.possibleRooms$ = this.payload.allRooms$
  }

  private inputs = (): FormInput[] => {
    return [this.supervisorInput, this.roomInput]
  }

  ngOnInit() {
    foreachOption(this.inputs(), (i) => i.onInit(this.formGroup))
  }

  ngOnDestroy() {
    foreachOption(this.inputs(), (i) => i.onDestroy())
  }

  prepareTableContent = (user: User, attr: string): string => {
    switch (attr) {
      case "name":
        return `${user.lastname}, ${user.firstname}`
      default:
        return user[attr]
    }
  }

  userFormControl = (): AbstractControl => {
    return this.formGroup.controls[this.supervisorInput.formControlName]
  }

  roomFormControl = (): AbstractControl => {
    return this.formGroup.controls[this.roomInput.formControlName]
  }

  validUserInControl = (): boolean => {
    return isUser(this.userFormControl().value)
  }

  add = () => {
    const supervisor = this.userFormControl().value

    if (!isUser(supervisor)) {
      return
    }

    this.payload.currentSupervisors =
      this.payload.currentSupervisors.concat(supervisor)
    this.updateEverything()
  }

  remove = (supervisor: User) => {
    this.payload.currentSupervisors = this.payload.currentSupervisors.filter(
      (x) => x.id !== supervisor.id,
    )
    this.updateEverything()
  }

  cancel = () => this.dialogRef.close({ kind: "cancel" })

  private updateDataSource = () =>
    (this.dataSource.data = this.payload.currentSupervisors)

  private updateSupervisorInput = () => {
    if (isOption(this.supervisorInput.data)) {
      this.supervisorInput.data.bindOptions(this.possibleSupervisors$)
      this.supervisorInputOption = this.supervisorInput.data
    }
  }

  private updateEverything = () => {
    resetControl(this.userFormControl())
    this.updateDataSource()
    this.calcPossibleSupervisors()
    this.updateSupervisorInput()
  }

  submit = () => {
    const room = this.roomFormControl().value

    if (this.formGroup.valid && isRoom(room)) {
      this.dialogRef.close({
        kind: "update",
        room: room,
        supervisors: this.payload.currentSupervisors,
      })
    } else {
      console.log("invalid form group")
    }
  }

  canDelete = () => this.payload.mode === DialogMode.edit

  delete = () => this.dialogRef.close({ kind: "delete" })
}
