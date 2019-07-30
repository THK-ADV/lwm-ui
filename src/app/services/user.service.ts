import {Injectable} from '@angular/core'
import {HttpParams} from '@angular/common/http'
import {Observable} from 'rxjs'
import {User} from '../models/user.model'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {HttpService} from './http.service'
import {map, tap} from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})
export class UserService implements AbstractCRUDService<User, User> {

    constructor(private http: HttpService) {
    }

    private path = 'users'

    get(): Observable<User[]> {
      const params = new HttpParams()
          .set('atomic', 'false')

      return this.http.get<User[]>(this.path, params)
            .pipe(
                map(users => users.slice(0, 10))
            )
    }

    delete(id: string): Observable<User> {
        throw new Error('Method not implemented.')
    }

    create(protocol: User): Observable<User[]> {
        throw new Error('Method not implemented.')
    }

    update(protocol: User, id: string): Observable<User> {
        throw new Error('Method not implemented.')
    }

}
