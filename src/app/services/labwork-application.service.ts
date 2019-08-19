import {Injectable} from '@angular/core'
import {HttpService, nonAtomicParams} from './http.service'
import {Observable} from 'rxjs'
import {LabworkApplication, LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {map} from 'rxjs/operators'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {NotImplementedError} from '../utils/functions'

@Injectable({
    providedIn: 'root'
})
export class LabworkApplicationService implements AbstractCRUDService<LabworkApplicationProtocol, LabworkApplicationAtom> {
    constructor(private http: HttpService) {
    }

    private readonly path = 'labworkApplications'

    // TODO better introduce labworkApplicationCount
    getApplicationCount(labwork: string): Observable<number> {
        return this.http.getAll<LabworkApplication[]>(this.path, nonAtomicParams.set('labwork', labwork)).pipe(
            map(xs => xs.length)
        )
    }

    createMany(protocol: LabworkApplicationProtocol): Observable<LabworkApplicationAtom[]> {
        return NotImplementedError()
    }

    delete(id: string): Observable<LabworkApplicationAtom> {
        return NotImplementedError()
    }

    getAll(): Observable<LabworkApplicationAtom[]> {
        return NotImplementedError()
    }

    update(protocol: LabworkApplicationProtocol, id: string): Observable<LabworkApplicationAtom> {
        return NotImplementedError()
    }
}
