import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {Html} from '../../html-builder/html-builder'

interface Text {
    kind: 'text'
    value: string
}

type ConfirmationBody = Html | Text

interface ConfirmationPayload {
    title: string
    body?: ConfirmationBody
}

export enum ConfirmationResult {
    ok, ko
}

@Component({
    selector: 'lwm-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent, ConfirmationResult>,
        @Inject(MAT_DIALOG_DATA) readonly payload: ConfirmationPayload
    ) {
    }

    static instance = (
        dialog: MatDialog,
        payload: ConfirmationPayload
    ): MatDialogRef<ConfirmDialogComponent, ConfirmationResult> =>
        dialog.open<ConfirmDialogComponent, ConfirmationPayload, ConfirmationResult>(
            ConfirmDialogComponent, {
                data: payload,
                panelClass: 'lwmConfirmationDialog'
            }
        )

    cancel = () =>
        this.dialogRef.close(ConfirmationResult.ko)

    submit = () =>
        this.dialogRef.close(ConfirmationResult.ok)
}
