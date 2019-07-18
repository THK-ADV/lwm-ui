import {Injectable} from '@angular/core'
import {HttpClient, HttpResponse} from '@angular/common/http'
import {Observable} from 'rxjs'
import {Room} from '../models/room.model'

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private http: HttpClient) {
    }

    private path = 'rooms'

    getRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(this.path)
    }

    delete(id: string): Observable<HttpResponse<Room>> {
        return this.http.delete<Room>(this.path + '/' + id, {observe: 'response'})
    }
}
