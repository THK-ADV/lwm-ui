import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Subscription} from 'rxjs'
import {MatDialog, MatSnackBar} from '@angular/material'
import {DeleteComponent} from '../shared_modals/delete/delete.component'
import {Room} from '../models/room.model'
import {LWMError} from '../services/http.service'
import {RoomAddComponent} from './room-add/room-add.component'

export interface RoomProtocol {
    label: string
    description: string
    capacity: number
}

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

    private subs: Subscription[]

    private displayedColumns: string[] = ['label', 'description', 'capacity', 'action']
    private dataSource = new MatTableDataSource<Room>()

    @ViewChild(MatSort, {static: true}) sort: MatSort

    constructor(private roomService: RoomService, private dialog: MatDialog, private _snackBar: MatSnackBar) {
        this.subs = []
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.subs.push(this.roomService.getRooms().subscribe(rooms => {
            this.dataSource.data = rooms
            this.sortBy('description')
        }))
    }

    onSelect(room) {
        console.log('onSelect' + room)
    }

    onCreate() {
        console.log('onCreate')

        const dialogRef = RoomAddComponent.instance(this.dialog, {label: '', description: '', capacity: 0})

        this.subs.push(dialogRef.afterClosed().subscribe(roomProtocol => {
            if (roomProtocol) { // TODO capacity can be null. proper error handling
                this.subs.push(this.roomService.create(roomProtocol)
                    .subscribe({next: this.create.bind(this), error: this.showError.bind(this)})
                )
            }
        }))
    }

    onEdit(room) {
        console.log('onEdit' + room)
    }

    onDelete(room) {
        const dialogRef = DeleteComponent.instance(this.dialog, {label: room.label, id: room.id})

        this.subs.push(dialogRef.afterClosed().subscribe(id => {
            if (id) {
                this.subs.push(this.roomService.delete(id)
                    .subscribe({next: this.delete.bind(this), error: this.showError.bind(this)})
                )
            }
        }))
    }

    private create(room: Room[]) {
        this.dataSource.data = this.dataSource.data.concat(room)
        this.showMessage('created: ' + room.map(r => r.label).join(', '), false)
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
        this.subs.forEach(s => s.unsubscribe())
    }
}
