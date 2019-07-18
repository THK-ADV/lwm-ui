import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {Observable} from 'rxjs'
import {Room} from '../models/room.model'

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private http: HttpClient) {
    }

    getRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(`rooms`)
    }
}
