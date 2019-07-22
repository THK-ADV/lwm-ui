import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {RoomProtocol} from '../../services/room.service'

@Component({
    selector: 'app-room-add',
    templateUrl: './room-add.component.html',
    styleUrls: ['./room-add.component.scss']
})
export class RoomAddComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<RoomAddComponent>, @Inject(MAT_DIALOG_DATA) public room: RoomProtocol) {

    }

    static instance(dialog: MatDialog, room: RoomProtocol): MatDialogRef<RoomAddComponent, any> {
        return dialog.open(RoomAddComponent, {
            width: '250px',
            data: room
        })
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    ngOnInit() {
    }

}
