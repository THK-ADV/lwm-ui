import {Injectable} from '@angular/core'
import {atomicParams, HttpService, nonAtomicParams} from './http.service'
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
    getApplicationCount = (labwork: string): Observable<number> => {
        return this.http.getAll<LabworkApplication[]>(this.path, nonAtomicParams.set('labwork', labwork)).pipe(
            map(xs => xs.length)
        )
    }

    getAllByLabworkAtom = (labwork: string): Observable<LabworkApplicationAtom[]> => {
        return this.http.getAll(this.path, atomicParams.set('labwork', labwork))
    }

    createMany = (protocol: LabworkApplicationProtocol): Observable<LabworkApplicationAtom[]> => {
        return this.http.createMany(this.path, [protocol], atomicParams)
    }

    delete = (id: string): Observable<LabworkApplicationAtom> => { // TODO backend returns LabworkApplicationDb which crashes the http response
        return this.http.delete(this.path, id)
    }

    getAll = (): Observable<LabworkApplicationAtom[]> => NotImplementedError()

    update = (protocol: LabworkApplicationProtocol, id: string): Observable<LabworkApplicationAtom> => NotImplementedError()
}
