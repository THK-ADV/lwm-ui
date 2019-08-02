import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {Room, RoomProtocol} from '../models/room.model'
import {HttpService} from './http.service'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'

@Injectable({
    providedIn: 'root'
})
export class RoomService implements AbstractCRUDService<RoomProtocol, Room> {

    constructor(private http: HttpService) {
    }

    private path = 'rooms'

    getAll(): Observable<Room[]> {
        return this.http.get(this.path)
    }

    delete(id: string): Observable<Room> {
        return this.http.delete(this.path, id)
    }

    create(room: RoomProtocol): Observable<Room[]> {
        return this.http.create(this.path, [room])
    }

    update(room: RoomProtocol, id: string): Observable<Room> {
        return this.http.put(this.path, id, room)
    }
}
