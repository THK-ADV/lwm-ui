import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Blacklist, BlacklistJSON, BlacklistProtocol} from '../models/blacklist.model'
import {HttpService} from './http.service'
import {map} from 'rxjs/operators'
import {applyFilter} from './http.filter'
import {convertManyBlacklists, mapBlacklistJSON} from '../utils/http-utils'

interface BlacklistFilter {
    attribute: 'global' | 'since' | 'until'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class BlacklistService implements AbstractCRUDService<BlacklistProtocol, Blacklist> {

    constructor(private http: HttpService) {
    }

    private path = 'blacklists'

    getAllWithFilter = (...filter: BlacklistFilter[]): Observable<Blacklist[]> => {
        return this.http.getAll<BlacklistJSON[]>(this.path, applyFilter(filter)).pipe(
            map(convertManyBlacklists)
        )
    }

    getAll = (): Observable<Blacklist[]> => {
        return this.http.getAll<BlacklistJSON[]>(this.path).pipe(
            map(convertManyBlacklists)
        )
    }

    delete = (id: string): Observable<Blacklist> => {
        return this.http.delete<BlacklistJSON>(this.path, id).pipe(
            map(mapBlacklistJSON)
        )
    }

    createMany = (protocol: BlacklistProtocol): Observable<Blacklist[]> => {
        return this.http.createMany<BlacklistProtocol, BlacklistJSON>(this.path, [protocol])
            .pipe(map(convertManyBlacklists))
    }

    update = (protocol: BlacklistProtocol, id: string): Observable<Blacklist> => {
        return this.http.put<BlacklistProtocol, BlacklistJSON>(this.path, id, protocol).pipe(
            map(mapBlacklistJSON)
        )
    }
}
