import {Injectable} from '@angular/core'
import {HttpService, nonAtomicParams} from './http.service'
import {Observable} from 'rxjs'

export interface LabworkApplication {
    labwork: string
    applicant: string
    friends: string[]
    lastModified: Date
    id: string
}

@Injectable({
    providedIn: 'root'
})
export class LabworkApplicationService {

    constructor(private http: HttpService) {
    }

    private readonly path = 'labworkApplications'

    getApplications(labwork: string): Observable<LabworkApplication[]> { // TODO better introduce labworkApplicationCount
        return this.http.getAll(this.path, nonAtomicParams.set('labwork', labwork))
    }
}
