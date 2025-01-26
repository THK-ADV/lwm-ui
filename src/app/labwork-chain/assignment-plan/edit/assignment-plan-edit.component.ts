import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core"
import { LabworkAtom } from "../../../models/labwork.model"
import { AssignmentEntry } from "../../../models/assignment-plan.model"
import { of, Subscription } from "rxjs"
import { MatDialog } from "@angular/material/dialog"
import { AssignmentEntriesService } from "../../../services/assignment-entries.service"
import { DialogMode } from "../../../shared-dialogs/dialog.mode"
import { LWMActionType } from "../../../table-action-button/lwm-actions"
import {
  assignmentEntryFormPayload,
  assignmentEntryProtocol,
  createAssignmentEntry$,
  deleteAndFetchAssignmentEntry$,
  takeoverAssignmentEntries$,
  updateAssignmentEntry$,
} from "./assignment-entry-view-model"
import { compose, isEmpty, subscribe } from "../../../utils/functions"
import {
  openDialog,
  openDialogFromPayload,
} from "../../../shared-dialogs/dialog-open-combinator"
import { DeleteDialogComponent } from "../../../shared-dialogs/delete/delete-dialog.component"
import {
  Decision,
  DecisionDialogComponent,
} from "../../../shared-dialogs/decision-dialog/decision-dialog.component"
import { AssignmentEntryTakeoverDialogComponent } from "../takeover-dialog/assignment-entry-takeover-dialog.component"

@Component({
  selector: "lwm-assignment-plan-edit",
  templateUrl: "./assignment-plan-edit.component.html",
  styleUrls: ["./assignment-plan-edit.component.scss"],
  standalone: false,
})
export class AssignmentPlanEditComponent implements OnDestroy {
  @Input() labwork: Readonly<LabworkAtom>
  @Input() assignmentEntries: Readonly<AssignmentEntry[]>
  @Input() hasPermission: Readonly<boolean>

  @Output() assignmentEntriesUpdate: EventEmitter<Readonly<AssignmentEntry[]>>

  private subs: Subscription[]

  constructor(
    private readonly assignmentPlanService: AssignmentEntriesService,
    private readonly dialog: MatDialog,
  ) {
    this.assignmentEntriesUpdate = new EventEmitter<
      Readonly<AssignmentEntry[]>
    >()
    this.subs = []
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe())
  }

  private emit = (xs: Readonly<AssignmentEntry[]>) =>
    this.assignmentEntriesUpdate.emit(xs)

  onCreate = () => {
    const addEntry = (): Subscription => {
      const protocol = assignmentEntryProtocol(this.labwork.id)
      const payload = assignmentEntryFormPayload(
        DialogMode.create,
        protocol,
        this.nextAssignmentIndex(),
      )
      const create$ = createAssignmentEntry$(
        this.labwork.course.id,
        this.assignmentPlanService,
      )
      const mergeEntries = (e: Readonly<AssignmentEntry>) =>
        this.assignmentEntries.concat(e)
      return subscribe(
        openDialogFromPayload(this.dialog, payload, create$),
        compose(mergeEntries, this.emit),
      )
    }

    const copyExisting = (): Subscription => {
      const dialog = AssignmentEntryTakeoverDialogComponent.instance(
        this.dialog,
        this.labwork,
      )

      const takeover = takeoverAssignmentEntries$(
        this.labwork.course.id,
        this.assignmentPlanService,
        this.labwork.id,
      )
      return subscribe(openDialog(dialog, takeover), this.emit)
    }

    const applyCreationStrategy = (d: Decision) => {
      const go = (): Subscription => {
        switch (d.kind) {
          case "first":
            return addEntry()
          case "second":
            return copyExisting()
        }
      }

      this.subs.push(go())
    }

    const choseCreationStrategy = (): Subscription => {
      const dialog = DecisionDialogComponent.instance(
        this.dialog,
        "Einträge selbst hinzufügen",
        "Aufgabenplan eines Praktikums kopieren",
      )
      return subscribe(openDialog(dialog, of), applyCreationStrategy)
    }

    const onCreate0 = (): Subscription => {
      if (isEmpty(this.assignmentEntries)) {
        return choseCreationStrategy()
      } else {
        return addEntry()
      }
    }

    this.subs.push(onCreate0())
  }

  onEdit = (entry: AssignmentEntry) => {
    const payload = assignmentEntryFormPayload(
      DialogMode.edit,
      { ...entry },
      entry.index,
    )
    const update$ = updateAssignmentEntry$(
      this.labwork.course.id,
      this.assignmentPlanService,
    )
    const updateEntries = (e: Readonly<AssignmentEntry>) =>
      this.assignmentEntries.map((x) => (x.id === e.id ? e : x))
    const sub = subscribe(
      openDialogFromPayload(this.dialog, payload, update$),
      compose(updateEntries, this.emit),
    )

    this.subs.push(sub)
  }

  onDelete = (entry: AssignmentEntry) => {
    const dialogData = {
      label: `Termin ${entry.index + 1}. ${entry.label}`,
      id: entry.id,
    }
    const dialogRef = DeleteDialogComponent.instance(this.dialog, dialogData)
    const delete$ = deleteAndFetchAssignmentEntry$(
      this.labwork,
      this.assignmentPlanService,
    )
    const sub = subscribe(openDialog(dialogRef, delete$), this.emit)

    this.subs.push(sub)
  }

  canCreate = (): LWMActionType | undefined => {
    return this.hasPermission ? "create" : undefined
  }

  private nextAssignmentIndex = (): number => this.assignmentEntries.length
}
