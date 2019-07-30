import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AbstractCRUDService } from '../abstract-crud/abstract-crud.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService implements AbstractCRUDService<User, User> {

  constructor(private http: HttpClient) { }

  private path = 'users'

  get(): Observable<User[]> {
    return this.http.get<User[]>(this.path)
  }
  delete(id: string): Observable<User> {
    throw new Error("Method not implemented.");
  }
  create(protocol: User): Observable<User[]> {
    throw new Error("Method not implemented.");
  }
  update(protocol: User, id: string): Observable<User> {
    throw new Error("Method not implemented.");
  }

}
