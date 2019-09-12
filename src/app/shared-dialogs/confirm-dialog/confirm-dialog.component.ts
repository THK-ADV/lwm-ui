import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'

interface ConfirmationPayload {
    title: string
    body: string
}

@Component({
    selector: 'lwm-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) private payload: ConfirmationPayload
    ) {
    }

    static instance(
        dialog: MatDialog,
        title: string,
        body: string
    ): MatDialogRef<ConfirmDialogComponent, boolean> {
        return dialog.open<ConfirmDialogComponent, ConfirmationPayload, boolean>(ConfirmDialogComponent, {
            data: {title: title, body: body},
            panelClass: 'lwmConfirmationDialog'
        })
    }

    private cancel = () => this.dialogRef.close(false)

    private submit = () => this.dialogRef.close(true)
}
