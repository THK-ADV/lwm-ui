import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractCRUDService } from '../abstract-crud/abstract-crud.service';
import { Blacklist, BlacklistProtocol } from '../models/blacklist.model';

@Injectable({
  providedIn: 'root'
})
export class BlacklistService implements AbstractCRUDService<BlacklistProtocol, Blacklist>  {


  getAll(): Observable<Blacklist[]> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Observable<Blacklist> {
    throw new Error("Method not implemented.");
  }
  createMany(protocol: BlacklistProtocol): Observable<Blacklist[]> {
    throw new Error("Method not implemented.");
  }
  update(protocol: BlacklistProtocol, id: string): Observable<Blacklist> {
    throw new Error("Method not implemented.");
  }

  constructor() { }
}
