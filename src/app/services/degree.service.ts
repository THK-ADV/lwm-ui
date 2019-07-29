import {Injectable} from '@angular/core'
import {AbstractCRUDService} from '../abstract-crud/abstract-crud.service'
import {HttpService} from './http.service'
import {Observable} from 'rxjs'
import {Degree, DegreeProtocol} from '../models/degree.model'

@Injectable({
    providedIn: 'root'
})
export class DegreeService implements AbstractCRUDService<DegreeProtocol, Degree> {

    constructor(private http: HttpService) {
    }

    private path = 'degrees'

    get(): Observable<Degree[]> {
        return this.http.get(this.path)
    }

    delete(id: string): Observable<Degree> {
        return this.http.delete(this.path, id)
    }

    create(degree: DegreeProtocol): Observable<Degree[]> {
        return this.http.create(this.path, degree)
    }

    update(degree: DegreeProtocol, id: string): Observable<Degree> {
        return this.http.put(this.path, id, degree)
    }
}