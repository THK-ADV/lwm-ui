import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {Employee, Lecturer, StudentAtom, User} from '../models/user.model'
import {atomicParams, HttpService, nonAtomicParams} from './http.service'
import {applyFilter} from './http.filter'

interface UserFilter {
    attribute: 'status' | 'degree'
    value: string
}

export interface BuddyResult {
    type: string
    buddy: User
    message: string
}

export interface StudentProtocol {
    systemId: string
    lastname: string
    firstname: string
    email: string
    registrationId: string
    enrollment: string
}

export interface EmployeeProtocol {
    systemId: string
    lastname: string
    firstname: string
    email: string
}

export const isStudentProtocol = (any: any): any is StudentProtocol => {
    return (any as StudentProtocol)?.enrollment !== undefined
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpService) {
    }

    private path = 'users'

    getAllWithFilter = (...filter: UserFilter[]): Observable<User[]> => this.http
        .getAll(this.path, applyFilter(filter, nonAtomicParams))

    allStudents = () =>
        this.getAllWithFilter({attribute: 'status', value: 'student'})

    getAll = (): Observable<User[]> =>
        this.http.getAll(this.path, nonAtomicParams)

    getAllAtomic = (): Observable<Array<StudentAtom | Employee | Lecturer>> =>
        this.http.getAll(this.path, atomicParams)

    get = (id: string): Observable<User> => this.http.get(this.path, id)

    buddy = (labworkId: string, applicantId: string, buddySystemId: string) => this.http
        .get_<BuddyResult>(`labworks/${labworkId}/${this.path}/${applicantId}/buddies/${buddySystemId}`)

    update = (protocol: StudentProtocol | EmployeeProtocol, id: string): Observable<StudentAtom | Employee | Lecturer> =>
        this.http.put(this.path, id, protocol, atomicParams)

    createFromToken = (): Observable<User> =>
        this.http.create(this.path, {}, nonAtomicParams)
}
