import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {RoomProtocol, RoomService} from '../services/room.service'
import {MatSort, Sort, SortDirection} from '@angular/material/sort'
import {MatTableDataSource} from '@angular/material/table'
import {Observable, Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {Room} from '../models/room.model'
import {
    CreateUpdateDialogComponent,
    FormInputData,
    FormOutputData,
    FormPayload
} from '../shared-dialogs/create-update/create-update-dialog.component'
import {ListTemplateEvent} from '../list-template/list-template.component'
import {AlertService} from '../services/alert.service'
import {Validators} from '@angular/forms'

enum DialogMode {
    edit, create
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

    constructor(private roomService: RoomService, private dialog: MatDialog, private alertService: AlertService) {
        this.subs = []
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.subscribe(this.roomService.getRooms(), rooms => {
            this.dataSource.data = rooms
            this.sortBy('description')
        })
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    eventEmitted(event: ListTemplateEvent) {
        switch (event) {
            case ListTemplateEvent.createButtonClicked:
                this.onCreate()
        }
    }

    onSelect(room) {
        this.onEdit(room)
    }

    onEdit(room) {
        this.openDialog(
            DialogMode.edit,
            room,
            updatedRoom => this.subscribe(this.roomService.update(updatedRoom, room.id), this.afterUpdate.bind(this))
        )
    }

    onDelete(room) {
        const dialogRef = DeleteDialogComponent.instance(this.dialog, {label: room.label, id: room.id})

        this.subscribe(
            dialogRef.afterClosed(),
            id => this.subscribe(
                this.roomService.delete(id),
                this.afterDelete.bind(this)
            )
        )
    }

    private onCreate() {
        this.openDialog(
            DialogMode.create,
            {label: '', description: '', capacity: 0},
            room => this.subscribe(this.roomService.create(room), this.afterCreate.bind(this))
        )
    }

    private dialogTitle(mode: DialogMode): string {
        switch (mode) {
            case DialogMode.create:
                return 'Raum erstellen'
            case DialogMode.edit:
                return 'Raum bearbeiten'
        }
    }

    private dialogSubmitTitle(mode: DialogMode): string {
        switch (mode) {
            case DialogMode.create:
                return 'Erstellen'
            case DialogMode.edit:
                return 'Aktualisieren'
        }
    }

    private openDialog<T>(mode: DialogMode, room: Room | RoomProtocol, next: (T) => void) {
        const isRoom = 'id' in room

        const inputData: FormInputData[] = [
            {
                formControlName: 'label',
                placeholder: 'Bezeichnung',
                type: 'text',
                isDisabled: isRoom,
                validator: Validators.required,
                value: room.label
            },
            {
                formControlName: 'description',
                placeholder: 'Beschreibung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: room.description
            },
            {
                formControlName: 'capacity',
                placeholder: 'Kapazität',
                type: 'number',
                isDisabled: false,
                validator: [Validators.required, Validators.min(0)],
                value: room.capacity
            }
        ]

        const payload: FormPayload = {
            headerTitle: this.dialogTitle(mode),
            submitTitle: this.dialogSubmitTitle(mode),
            data: inputData,
            builder: outputData => isRoom ? this.updateRoom(room as Room, outputData) : this.createRoom(room, outputData)
        }

        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)

        this.subscribe(dialogRef.afterClosed(), next)
    }

    private subscribe<T>(observable: Observable<T>, next: (T) => void) {
        this.subs.push(observable.subscribe(e => {
            if (e) {
                next(e)
            }
        }))
    }

    private createRoom(room: RoomProtocol, data: FormOutputData[]): RoomProtocol {
        data.forEach(d => room[d.formControlName] = d.value)
        return room
    }

    private updateRoom(room: Room, data: FormOutputData[]): Room {
        return this.createRoom(room, data) as Room
    }

    private afterUpdate(room: Room) {
        this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(room))
    }

    private afterCreate(room: Room[]) {
        this.dataSource.data = this.dataSource.data.concat(room)
        this.alertService.reportAlert('success', 'created: ' + room.map(JSON.stringify.bind(this)).join(', '))
    }

    private afterDelete(room: Room) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== room.id)
        this.alertService.reportAlert('success', 'deleted: ' + JSON.stringify(room))
    }

    private sortBy(label: string, ordering: SortDirection = 'asc') {
        const sortState: Sort = {active: label, direction: ordering}
        this.sort.active = sortState.active
        this.sort.direction = sortState.direction
        this.sort.sortChange.emit(sortState)
    }
}
