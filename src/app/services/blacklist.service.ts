import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {NotImplementedError} from '../utils/functions'
import {HttpService} from './http.service'
import {map} from 'rxjs/operators'
import {Time} from '../models/time.model'
import {applyFilter} from './http.filter'

interface BlacklistJSON {
    label: string
    date: string
    start: string
    end: string
    global: boolean
    id: string
}

interface BlacklistFilter {
    attribute: 'global'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class BlacklistService implements AbstractCRUDService<BlacklistProtocol, Blacklist> {

    constructor(private http: HttpService) {
    }

    private path = 'blacklists'

    getAllWithFilter(...filter: BlacklistFilter[]): Observable<Blacklist[]> {
        return this.http.getAll<BlacklistJSON[]>(this.path, applyFilter(filter))
            .pipe(map(this.convertMany))
    }

    getAll(): Observable<Blacklist[]> {
        return this.http.getAll<BlacklistJSON[]>(this.path)
            .pipe(map(this.convertMany))
    }

    delete(id: string): Observable<Blacklist> {
        return this.http.delete(this.path, id)
    }

    createMany(protocol: BlacklistProtocol): Observable<Blacklist[]> {
        return this.http.createMany<BlacklistProtocol, BlacklistJSON>(this.path, [protocol])
            .pipe(map(this.convertMany))
    }

    update(protocol: BlacklistProtocol, id: string): Observable<Blacklist> {
        throw NotImplementedError(JSON.stringify(protocol))
    }

    convertMany = (blacklists: BlacklistJSON[]): Blacklist[] => blacklists.map(this.convert)

    convert = (b: BlacklistJSON): Blacklist => {
        const date = new Date(b.date)

        return {
            label: b.label,
            date: date,
            start: Time.fromTimeString(b.start, date),
            end: Time.fromTimeString(b.end, date),
            global: b.global,
            id: b.id
        }
    }
}
