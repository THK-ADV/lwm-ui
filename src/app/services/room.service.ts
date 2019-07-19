import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {Room} from '../models/room.model'
import {HttpService} from './http.service'

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
}
