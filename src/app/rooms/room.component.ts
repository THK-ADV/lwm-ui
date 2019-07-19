import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Subscription} from 'rxjs'
import {MatDialog, MatSnackBar} from '@angular/material'
import {DeleteComponent} from '../shared_modals/delete/delete.component'
import {Room} from '../models/room.model'
import {LWMError} from '../services/http.service'

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

    private roomGetSub: Subscription
    private roomDeleteSub: Subscription

    private displayedColumns: string[] = ['label', 'description', 'capacity', 'action']
    private dataSource = new MatTableDataSource<Room>()

    @ViewChild(MatSort, {static: true}) sort: MatSort

    constructor(private roomService: RoomService, private dialog: MatDialog, private _snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.roomGetSub = this.roomService.getRooms().subscribe(rooms => {
            this.dataSource.data = rooms
            this.sortBy('description')
        })
    }

    onSelect(room) {
        console.log('select' + room)
    }

    onEdit(room) {
        console.log('edit' + room)
    }

    onDelete(room) {
        const dialogRef = DeleteComponent.instance(this.dialog, {label: room.label, id: room.id})

        dialogRef.afterClosed().subscribe(id => {
            if (id) {
                this.roomDeleteSub = this.roomService.delete(id)
                    .subscribe({next: this.delete.bind(this), error: this.showError.bind(this)})
            }
        })
    }

    private delete(room: Room) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== room.id)
        this.showMessage('deleted: ' + room.label, false)
    }

    private showMessage(message: string, isError: boolean) {
        this._snackBar.open(message, undefined, {
            duration: isError ? 5000 : 2000,
        })
    }

    private showError(error: LWMError) {
        this.showMessage(error.message(), true)
    }

    private sortBy(label: string, ordering: SortDirection = 'asc') {
        const sortState: Sort = {active: label, direction: ordering}
        this.sort.active = sortState.active
        this.sort.direction = sortState.direction
        this.sort.sortChange.emit(sortState)
    }

    ngOnDestroy(): void {
        this.roomGetSub.unsubscribe()
        this.roomDeleteSub.unsubscribe()
    }
}
