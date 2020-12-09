import {AuthorityAtom} from '../models/authority.model'
import {UserRole} from '../models/role.model'
import {exists, foldUndefined} from './functions'
import {KeycloakTokenService} from '../services/keycloak-token.service'
import {AuthorityService} from '../services/authority.service'
import {EMPTY, Observable} from 'rxjs'
import {catchError, retry, switchMap} from 'rxjs/operators'
import {UserService} from '../services/user.service'
import {AlertService} from '../services/alert.service'

export const hasAnyRole = (authorities: Readonly<AuthorityAtom[]>, ...roles: UserRole[]): boolean =>
    exists(authorities, a => exists(roles, r => hasRole(r, a)))

export const hasRole = (status: UserRole, auth: AuthorityAtom): boolean =>
    auth.role.label === status

export const isAdmin = (authorities: Readonly<AuthorityAtom[]>): boolean =>
    hasAnyRole(authorities, UserRole.admin)

export const isCourseManager = (authorities: Readonly<AuthorityAtom[]>, courseId: string): boolean =>
    authorities.some(a => foldUndefined(
        a.course,
        c => c.id === courseId,
        () => false) && hasRole(UserRole.courseManager, a)
    )

export const fetchCurrentUserAuthorities$ = (
    authorityService: AuthorityService,
    tokenService: KeycloakTokenService
): Observable<AuthorityAtom[]> => foldUndefined(
    tokenService.get('systemId'),
    authorityService.getAuthorities,
    () => EMPTY
)

export const fetchCurrentUserAuthoritiesOrCreateNewUser$ = (
    authorityService: AuthorityService,
    tokenService: KeycloakTokenService,
    userService: UserService,
    alertService: AlertService
): Observable<AuthorityAtom[]> =>
    fetchCurrentUserAuthorities$(authorityService, tokenService).pipe(
        catchError(err => {
            if (err.status !== 409) {
                return EMPTY
            }
            return userService.createFromToken().pipe(
                switchMap(user => {
                    alertService.reset()
                    return authorityService.getAuthorities(user.systemId)
                }),
                retry(1)
            )
        })
    )
