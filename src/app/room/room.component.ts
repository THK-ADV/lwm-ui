import {Component} from '@angular/core'
import {Creatable, Deletable, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable} from 'rxjs'
import {Room, RoomProtocol} from '../models/room.model'
import {RoomService} from '../services/room.service'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputNumber} from '../shared-dialogs/forms/form.input.number'

@Component({
    selector: 'lwm-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent {

    columns: TableHeaderColumn[]
    tableContent: (model: Readonly<Room>, attr: string) => string
    rooms$: Observable<Room[]>
    creatable: Creatable<RoomProtocol, Room>
    deletable: Deletable<Room>

    constructor(private readonly service: RoomService) {
        this.columns = [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'description', title: 'Beschreibung'},
            {attr: 'capacity', title: 'Kapazität'}
        ]

        this.tableContent = (r, attr) => r[attr]
        this.rooms$ = service.getAll()
        this.creatable = {
            dialogTitle: 'Raum',
            emptyProtocol: () => ({label: '', description: '', capacity: 0}),
            makeInput: (attr, e) => {
                switch (attr) {
                    case 'label':
                        return {isDisabled: isUniqueEntity(e), data: new FormInputString(e.label)}
                    case 'description':
                        return {isDisabled: false, data: new FormInputString(e.description)}
                    case 'capacity':
                        return {isDisabled: false, data: new FormInputNumber(e.capacity)}
                }
            },
            commitProtocol: (p, s) => ({...p, label: s?.label ?? p.label}),
            create: service.create,
            update: service.update,
            compoundFromGroupValidator: () => undefined
        }
        this.deletable = {
            titleForDialog: _ => _.label,
            delete: service.delete
        }
    }

}
