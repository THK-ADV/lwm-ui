import {Injectable} from '@angular/core'
import {HttpParams} from '@angular/common/http'
import {AuthorityAtom} from '../models/authorityAtom.model'
import {Observable} from 'rxjs'
import {HttpService} from './http.service'

@Injectable({
    providedIn: 'root'
})
export class AuthorityService {

    constructor(private http: HttpService) {
    }

    getAuthorities(systemId: string): Observable<AuthorityAtom[]> {
        const params = new HttpParams().set('systemId', systemId)
        return this.http.get<AuthorityAtom[]>('authorities', params)
    }

    isAdmin(authorities: AuthorityAtom[]): boolean {
        return authorities.some(auth => auth.role.label === 'Administrator')
    }
}
