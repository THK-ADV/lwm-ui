import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {Room} from '../models/room.model'
import {HttpService} from './http.service'

export interface RoomProtocol {
    label: string
    description: string
    capacity: number
}


@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private http: HttpService) {
    }

    private path = 'rooms'

    getRooms(): Observable<Room[]> {
        return this.http.get(this.path)
    }

    delete(id: string): Observable<Room> {
        return this.http.delete(this.path, id)
    }

    create(room: RoomProtocol): Observable<Room[]> {
        return this.http.create(this.path, room)
    }

    update(room: RoomProtocol, id: string): Observable<Room> {
        return this.http.put(this.path, id, room)
    }
}
