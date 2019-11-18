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

    getAllWithFilter = (...filter: UserFilter[]): Observable<User[]> => this.http
        .getAll(this.path, applyFilter(filter, nonAtomicParams))

    allStudents = () => this.getAllWithFilter({attribute: 'status', value: 'student'})

    getAll = (): Observable<User[]> => this.http.getAll(this.path, nonAtomicParams)

    delete = (id: string): Observable<User> => NotImplementedError()

    create = (protocol: User): Observable<User> => NotImplementedError()

    update = (protocol: User, id: string): Observable<User> => NotImplementedError()
}
