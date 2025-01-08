import { ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import {Injectable} from '@angular/core'
import {EMPTY, Observable, of} from 'rxjs'

export const getCourseId = (route: ActivatedRoute): string =>
    route.snapshot.data.courseId

@Injectable()
export class CourseParamResolver  {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
        const course = route.paramMap.get('cid')

        if (!course) {
            return EMPTY
        }

        return of(course)
    }
}
