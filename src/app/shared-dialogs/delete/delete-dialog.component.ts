import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {DIALOG_WIDTH} from '../dialog-constants'

interface DialogData {
    label: string
    id: string
}

@Component({
    selector: 'app-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    static instance(dialog: MatDialog, data: DialogData): MatDialogRef<DeleteDialogComponent, any> {
        return dialog.open(DeleteDialogComponent, {
            width: DIALOG_WIDTH,
            data: data
        })
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    ngOnInit() {
    }

}
