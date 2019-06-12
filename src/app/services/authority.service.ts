import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthorityAtom } from '../models/authorityAtom.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {

  constructor(private http: HttpClient) { }
 
  getAuthorities(systemId: string): Observable<AuthorityAtom[]> {
    return this.http.get<AuthorityAtom[]>('authorities?systemId=' + systemId);
  }
  
}
