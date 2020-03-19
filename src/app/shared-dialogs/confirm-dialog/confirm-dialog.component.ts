import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'

interface ConfirmationPayload {
    title: string
    body: string
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
        title: string,
        body: string
    ): MatDialogRef<ConfirmDialogComponent, ConfirmationResult> =>
        dialog.open<ConfirmDialogComponent, ConfirmationPayload, ConfirmationResult>(
            ConfirmDialogComponent, {
                data: {title: title, body: body},
                panelClass: 'lwmConfirmationDialog'
            }
        )

    cancel = () =>
        this.dialogRef.close(ConfirmationResult.ko)

    submit = () =>
        this.dialogRef.close(ConfirmationResult.ok)
}
