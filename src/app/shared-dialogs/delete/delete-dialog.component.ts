import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {DIALOG_WIDTH} from '../dialog-constants'
import {UniqueEntity} from '../../models/unique.entity.model'

interface DialogData extends UniqueEntity {
    label: string
}

@Component({
    selector: 'app-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
    constructor(public dialogRef: MatDialogRef<DeleteDialogComponent, string>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    static instance(dialog: MatDialog, data: DialogData): MatDialogRef<DeleteDialogComponent, string> {
        return dialog.open(DeleteDialogComponent, {
            width: DIALOG_WIDTH,
            data: data,
            panelClass: 'lwmDeleteDialog'
        })
    }

    onNoClick(): void {
        this.dialogRef.close()
    }
}
