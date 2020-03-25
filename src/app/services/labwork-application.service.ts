import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {NotImplementedError} from '../utils/functions'
import {makePath} from '../utils/component.utils'

@Injectable({
    providedIn: 'root'
})
export class LabworkApplicationService implements AbstractCRUDService<LabworkApplicationProtocol, LabworkApplicationAtom> {
    constructor(private http: HttpService) {
    }

    private readonly path = 'labworkApplications'

    count = (
        courseId: string,
        labworkId: string
    ): Observable<number> => this.http
        .get_(`${makePath(this.path, courseId, labworkId)}/count`)

    getAllByLabworkAtom = (labwork: string): Observable<LabworkApplicationAtom[]> => this.http
        .getAll(this.path, atomicParams.set('labwork', labwork))

    create = (protocol: LabworkApplicationProtocol): Observable<LabworkApplicationAtom> => this.http
        .create(this.path, protocol, atomicParams)

    delete = (id: string): Observable<LabworkApplicationAtom> => this.http.delete(this.path, id)

    getAll = (): Observable<LabworkApplicationAtom[]> => NotImplementedError()

    update = (protocol: LabworkApplicationProtocol, id: string): Observable<LabworkApplicationAtom> => this.http
        .put(this.path, id, protocol, atomicParams)
}
