import {Injectable} from '@angular/core'
import {ActivatedRoute, Resolve} from '@angular/router'
import {Observable} from 'rxjs'
import {AuthorityAtom} from '../models/authority.model'
import {fetchCurrentUserAuthorities$} from '../utils/role-checker'
import {AuthorityService} from '../services/authority.service'
import {KeycloakTokenService} from '../services/keycloak-token.service'

export const userAuths = (route: ActivatedRoute): AuthorityAtom[] => route.snapshot.data.userAuths

@Injectable()
export class UserAuthorityResolver implements Resolve<Observable<AuthorityAtom[]>> {

    constructor(
        private readonly authorityService: AuthorityService,
        private readonly tokenService: KeycloakTokenService
    ) {
    }

    resolve(): Observable<AuthorityAtom[]> {
        return fetchCurrentUserAuthorities$(this.authorityService, this.tokenService)
    }
}
