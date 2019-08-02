import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Student, User } from '../models/user.model'
import { AbstractCRUDService } from '../abstract-crud/abstract-crud.service'
import { HttpService, nonAtomicParams } from './http.service'
import { map } from 'rxjs/operators'
import { NotImplementedError } from '../utils/functions'

@Injectable({
  providedIn: 'root'
})
export class UserService implements AbstractCRUDService<User, User> {

  constructor(private http: HttpService) {
  }

  private path = 'users'


  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.path, nonAtomicParams)
      .pipe(
        map(users => users.filter(u => (u as Student).registrationId === undefined)) // TODO remove
      )
  }

  delete(id: string): Observable<User> {
    return NotImplementedError()
  }

  create(protocol: User): Observable<User[]> {
    throw new Error('Method not implemented.')
  }


  update(protocol: User, id: string): Observable<User> {
    return NotImplementedError()
  }

}
