import {Injectable} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {Observable} from 'rxjs'
import {AuthorityAtom} from '../models/authority.model'
import {fetchCurrentUserAuthorities$, isAdmin, isCourseManager} from '../utils/role-checker'
import {AuthorityService} from '../services/authority.service'
import {KeycloakTokenService} from '../services/keycloak-token.service'

export const userAuths = (route: ActivatedRoute): AuthorityAtom[] => route.snapshot.data.userAuths

export const hasCourseManagerPermission = (route: ActivatedRoute, courseId: string) => {
    const auths = userAuths(route)
    return isCourseManager(auths, courseId) || isAdmin(auths)
}

@Injectable()
export class UserAuthorityResolver  {

    constructor(
        private readonly authorityService: AuthorityService,
        private readonly tokenService: KeycloakTokenService
    ) {
    }

    resolve(): Observable<AuthorityAtom[]> {
        return fetchCurrentUserAuthorities$(this.authorityService, this.tokenService)
    }
}
