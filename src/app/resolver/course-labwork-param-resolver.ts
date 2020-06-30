import {Injectable} from '@angular/core'
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router'
import {EMPTY, Observable, of} from 'rxjs'

export interface Params {
    course: string,
    labwork: string
}

export const params = (route: ActivatedRoute): Params =>
    route.snapshot.data.params

@Injectable()
export class CourseLabworkParamResolver implements Resolve<Observable<Params>> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Params> {
        const course = route.paramMap.get('cid')
        const labwork = route.paramMap.get('lid')

        if (!(course && labwork)) {
            return EMPTY
        }

        return of({course: course, labwork: labwork})
    }
}
