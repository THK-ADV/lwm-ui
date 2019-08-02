import {Observable} from 'rxjs'

export interface AbstractCRUDService<Protocol, Model> {
    getAll(): Observable<Model[]>

    delete(id: string): Observable<Model>

    create(protocol: Protocol): Observable<Model[]>

    update(protocol: Protocol, id: string): Observable<Model>
}
