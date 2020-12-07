import {Component, OnInit} from '@angular/core'
import {Router} from '@angular/router'
import {KeycloakTokenService} from './services/keycloak-token.service'
import {AuthorityService} from './services/authority.service'
import {fetchCurrentUserAuthorities$} from './utils/role-checker'
import {AuthorityAtom} from './models/authority.model'
import {EMPTY, Observable} from 'rxjs'
import {catchError, switchMap} from 'rxjs/operators'
import {makeErrorMessage} from './services/http.service'
import {UserService} from './services/user.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    auths$: Observable<AuthorityAtom[]>
    errMsg: string

    constructor(
        private readonly router: Router,
        private readonly tokenService: KeycloakTokenService,
        private readonly authorityService: AuthorityService,
        private readonly userService: UserService
    ) {
        this.auths$ = fetchCurrentUserAuthorities$(this.authorityService, this.tokenService).pipe(
            catchError(err => {
                console.log('backend return error')

                if (err.status === 409) {
                    console.log('409... creating user')
                    this.errMsg = err.message

                    return this.userService.createFromToken().pipe(
                        catchError(err2 => {
                            this.errMsg = err2.message
                            return EMPTY
                        }),
                        switchMap(user => {
                            this.errMsg = 'user created: ' + user.systemId

                            return fetchCurrentUserAuthorities$(this.authorityService, this.tokenService)
                        })
                    )
                } else {
                    this.errMsg = err.message
                    return EMPTY
                }
            })
        )
    }

    ngOnInit() {

    }
}
