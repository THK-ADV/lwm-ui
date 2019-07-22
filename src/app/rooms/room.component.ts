import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Observable, Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {DeleteComponent} from '../shared_modals/delete/delete.component'
import {Room} from '../models/room.model'
import {RoomAddComponent} from './room-add/room-add.component'
import {ListTemplateEvent} from '../list-template/list-template.component'
import {AlertService} from '../services/alert.service'

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

    constructor(private roomService: RoomService, private dialog: MatDialog, private alertService: AlertService) {
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

    eventEmitted(event: ListTemplateEvent) {
        switch (event) {
            case ListTemplateEvent.createButtonClicked:
                this.onCreate()
        }
    }

    private onCreate() {
        const dialogRef = RoomAddComponent.instance(this.dialog, {label: '', description: '', capacity: 0})

        this.subscribe(
            dialogRef.afterClosed(),
            p => this.subscribe(
                this.roomService.create(p),
                this.create.bind(this)
            )
        )
    }

    onEdit(room) {
        console.log('onEdit' + room)
    }

    onDelete(room) {
        const dialogRef = DeleteComponent.instance(this.dialog, {label: room.label, id: room.id})

        this.subscribe(
            dialogRef.afterClosed(),
            id => this.subscribe(
                this.roomService.delete(id),
                this.delete.bind(this)
            )
        )
    }

    private subscribe<T>(observable: Observable<T>, next: (T) => void) {
        this.subs.push(observable.subscribe(e => {
            if (e) {
                next(e)
            }
        }))
    }

    private create(room: Room[]) {
        this.dataSource.data = this.dataSource.data.concat(room)
        this.alertService.addAlert('success', 'created: ' + room.map(r => r.label).join(', '))
    }

    private delete(room: Room) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== room.id)
        this.alertService.addAlert('success', 'deleted: ' + room.label)
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
