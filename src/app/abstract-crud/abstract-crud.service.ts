import {Observable} from 'rxjs'
import {ParamFilter} from '../services/http.filter'

export interface AbstractCRUDService<Protocol, Model> {
    getAll(): Observable<Model[]>

    delete(id: string): Observable<Model>

    createMany(protocol: Protocol): Observable<Model[]>

    update(protocol: Protocol, id: string): Observable<Model>
}
