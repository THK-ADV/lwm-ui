import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {User} from '../models/user.model'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {HttpService, nonAtomicParams} from './http.service'
import {NotImplementedError} from '../utils/functions'
import {applyFilter} from './http.filter'

interface UserFilter {
    attribute: 'status' | 'degree'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService implements AbstractCRUDService<User, User> {

    constructor(private http: HttpService) {
    }

    private path = 'users'

    getAllWithFilter(...filter: UserFilter[]): Observable<User[]> {
        return this.http.getAll<User[]>(this.path, applyFilter(filter, nonAtomicParams))
    }

    getAll(): Observable<User[]> {
        return this.http.getAll<User[]>(this.path, nonAtomicParams)
    }

    delete(id: string): Observable<User> {
        return NotImplementedError()
    }

    createMany(protocol: User): Observable<User[]> {
        throw new Error('Method not implemented.')
    }

    update(protocol: User, id: string): Observable<User> {
        return NotImplementedError()
    }

}
