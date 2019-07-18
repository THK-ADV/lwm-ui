import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'

interface DialogData {
    label: string
    id: string
}

@Component({
    selector: 'app-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<DeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    static instance(dialog: MatDialog, data: DialogData): MatDialogRef<DeleteComponent, any> {
        return dialog.open(DeleteComponent, {
            width: '250px',
            data: data
        })
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    ngOnInit() {
    }

}
