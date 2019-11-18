import {UserStatus} from '../models/userStatus.model'
import {AuthorityAtom} from '../models/authority.model'
import {UserRole} from '../models/role.model'
import {foldUndefined} from './functions'
import {KeycloakTokenKey, KeycloakTokenService} from '../services/keycloak-token.service'
import {AuthorityService} from '../services/authority.service'
import {EMPTY, Observable} from 'rxjs'

export const hasAnyStatus = (status: UserStatus, authorities: Readonly<AuthorityAtom[]>): boolean => {
    return authorities.some(auth => hasStatus(status, auth))
}

export const hasStatus = (status: UserStatus, auth: AuthorityAtom): boolean => auth.role.label === status

export const hasAdminStatus = (authorities: Readonly<AuthorityAtom[]>): boolean => hasAnyStatus(UserStatus.admin, authorities)

export const isCourseManager = (courseId: string, authorities: Readonly<AuthorityAtom[]>): boolean => authorities.some(a => {
    return foldUndefined(a.course, c => c.id === courseId, () => false) && a.role.label === UserRole.courseManager
})

export const fetchCurrentUserAuthorities$ = (
    authorityService: AuthorityService,
    tokenService: KeycloakTokenService
): Observable<AuthorityAtom[]> => foldUndefined(
    tokenService.get(KeycloakTokenKey.SYSTEMID),
    authorityService.getAuthorities,
    () => EMPTY
)
