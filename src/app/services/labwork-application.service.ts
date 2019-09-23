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

    getApplicationCount = (labwork: string): Observable<number> => this.http
        .getAll<LabworkApplication[]>(this.path, nonAtomicParams.set('labwork', labwork))
        .pipe(map(xs => xs.length)) // TODO better introduce labworkApplicationCount

    getAllByLabworkAtom = (labwork: string): Observable<LabworkApplicationAtom[]> => this.http
        .getAll(this.path, atomicParams.set('labwork', labwork))

    create = (protocol: LabworkApplicationProtocol): Observable<LabworkApplicationAtom> => this.http
        .create(this.path, protocol, atomicParams)

    delete = (id: string): Observable<LabworkApplicationAtom> => this.http.delete(this.path, id)

    getAll = (): Observable<LabworkApplicationAtom[]> => NotImplementedError()

    update = (protocol: LabworkApplicationProtocol, id: string): Observable<LabworkApplicationAtom> => NotImplementedError()
}
