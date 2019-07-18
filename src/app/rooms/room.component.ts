import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Subscription} from 'rxjs'
import {MatDialog, MatSnackBar} from '@angular/material'
import {DeleteComponent} from '../shared_modals/delete/delete.component'
import {Room} from '../models/room.model'

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

    select(room) {
        console.log('select' + room)
    }

    edit(room) {
        console.log('edit' + room)
    }

    delete(room) {
        const dialogRef = DeleteComponent.instance(this.dialog, {label: room.label, id: room.id})

        dialogRef.afterClosed().subscribe(id => {
            if (id) {
                // this.delete0('7f3488ef-9f94-4712-a788-3d035e6d3868') // for testing
                this.delete0(id)
            }
        })
    }

    private delete0(id: string) {
        this.roomDeleteSub = this.roomService.delete(id).subscribe(resp => {
            this.remove(id)
            this.showMessage('deleted ' + (resp.body as Room).label, false) // TODO better type checking
        }, error => {
            console.log(error)
            this.showMessage(error.error.message, true)
        })
    }

    private remove(id: string) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== id) // TODO remove by index
    }

    private showMessage(message: string, isError: boolean) {
        this._snackBar.open(message, undefined, {
            duration: isError ? 5000 : 2000,
        })
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
