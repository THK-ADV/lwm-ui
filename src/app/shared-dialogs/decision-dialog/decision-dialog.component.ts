import { Component, Inject } from "@angular/core"
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog"

export interface First {
  kind: "first"
  text: string
}

export interface Second {
  kind: "second"
  text: string
}

export type Decision = First | Second

interface DecisionPayload {
  first: string
  second: string
}

@Component({
  selector: "lwm-decision-dialog",
  templateUrl: "./decision-dialog.component.html",
  styleUrls: ["./decision-dialog.component.scss"],
  standalone: false,
})
export class DecisionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DecisionDialogComponent, Decision>,
    @Inject(MAT_DIALOG_DATA) readonly payload: DecisionPayload,
  ) {}

  static instance(
    dialog: MatDialog,
    first: string,
    second: string,
  ): MatDialogRef<DecisionDialogComponent, Decision> {
    return dialog.open<DecisionDialogComponent, DecisionPayload, Decision>(
      DecisionDialogComponent,
      {
        data: { first: first, second: second },
        panelClass: "lwmDecisionDialog",
      },
    )
  }

  cancel = () => this.dialogRef.close(undefined)

  first = () =>
    this.dialogRef.close({ kind: "first", text: this.payload.first })

  second = () =>
    this.dialogRef.close({ kind: "second", text: this.payload.second })
}
