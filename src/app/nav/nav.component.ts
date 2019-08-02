import {MediaMatcher} from '@angular/cdk/layout'
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {AuthorityAtom} from '../models/authority.model'
import {AuthorityService} from '../services/authority.service'
import {KeycloakTokenKey, KeycloakTokenService} from '../services/keycloak-token.service'
import {Config} from '../models/config.model'
import {User} from '../models/user.model'
import {CourseAtom} from '../models/course'
import {KeycloakService} from 'keycloak-angular'
import {AlertService} from '../services/alert.service'

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

    private authoritySub: Subscription
    private moduleAuthorities: AuthorityAtom[]
    private roleAuthorities: AuthorityAtom[]
    private configs: Config[]
    private user: User

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private authorityService: AuthorityService,
        private tokenService: KeycloakTokenService,
        private keycloakService: KeycloakService,
        private alertService: AlertService
    ) {
        this.moduleAuthorities = []
        this.roleAuthorities = []
        this.configs = Config.All()

        this.mobileQuery = media.matchMedia('(max-width: 600px)')
        this._mobileQueryListener = () => changeDetectorRef.detectChanges()
        this.mobileQuery.addListener(this._mobileQueryListener)
    }

    mobileQuery: MediaQueryList
    private _mobileQueryListener: () => void

    private unzipAuthorities(authorities: AuthorityAtom[]) {
        authorities.forEach(auth => {
            if (auth.course === undefined) {
                this.roleAuthorities.push(auth)
            } else {
                this.moduleAuthorities.push(auth)
            }
        })

        const first = authorities[0]
        if (first) {
            this.user = first.user
        }

        this.moduleAuthorities = this.moduleAuthorities
            .sort((a, b) => (a.course as CourseAtom).abbreviation < (b.course as CourseAtom).abbreviation ? -1 : 1)
    }

    isAdmin(): boolean {
        return this.authorityService.isAdmin(this.roleAuthorities)
    }

    getInitials(): string {
        if (this.user) {
            return this.user.firstname.substring(0, 1).toUpperCase() + this.user.lastname.substring(0, 1).toUpperCase()
        } else {
            return 'n.a'
        }
    }

    ngOnInit(): void {
        const systemId = this.tokenService.get(KeycloakTokenKey.SYSTEMID)

        if (systemId) {
            this.authoritySub = this.authorityService.getAuthorities(systemId)
                .subscribe(this.unzipAuthorities.bind(this))
        }
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener)
    }

    logout(): void {
        this.keycloakService.logout().then() // TODO move to service
    }

    linkClicked() {
        this.alertService.reset()
    }
}
