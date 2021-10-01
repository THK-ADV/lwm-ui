import {Injectable} from '@angular/core'
import {HttpService} from './http.service'
import {User} from '../models/user.model'
import {Observable} from 'rxjs'

export interface UserSyncResult {
    previous: User
    updated: User
}

@Injectable({
    providedIn: 'root'
})
export class UserSyncService {

    constructor(private readonly http: HttpService) {
    }

    sync = (userId: string): Observable<UserSyncResult> =>
        this.http.put_(`usersSync/${userId}`, {})
}
