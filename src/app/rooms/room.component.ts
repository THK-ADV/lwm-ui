import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {DeleteComponent} from '../shared_modals/delete/delete.component'

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

    private roomSub: Subscription

    private displayedColumns: string[] = ['label', 'description', 'capacity', 'action']
    private dataSource = new MatTableDataSource()

    @ViewChild(MatSort, {static: true}) sort: MatSort

    constructor(private roomService: RoomService, private dialog: MatDialog) {
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.roomSub = this.roomService.getRooms().subscribe(rooms => {
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
            console.log('The dialog was closed ' + id)
        })
    }

    private sortBy(label: string, ordering: SortDirection = 'asc') {
        const sortState: Sort = {active: label, direction: ordering}
        this.sort.active = sortState.active
        this.sort.direction = sortState.direction
        this.sort.sortChange.emit(sortState)
    }

    ngOnDestroy(): void {
        this.roomSub.unsubscribe()
    }
}
