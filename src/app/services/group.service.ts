import {Injectable} from '@angular/core'
import {atomicParams, HttpService} from './http.service'
import {Observable} from 'rxjs'
import {makePath} from '../utils/component.utils'
import {applyFilter} from './http.filter'
import {GroupAtom} from '../models/group.model'

interface GroupFiler {
    attribute: 'labwork'
    value: string
}

@Injectable({
    providedIn: 'root'
})
export class GroupService {

    constructor(private readonly http: HttpService) {
    }

    private readonly path = 'groups'

    getAllWithFilter(courseId: string, labworkId: string, ...filter: GroupFiler[]): Observable<GroupAtom[]> {
        return this.http.getAll(
            makePath(this.path, courseId, labworkId),
            applyFilter(filter, atomicParams)
        )
    }
}