import {MediaMatcher} from '@angular/cdk/layout'
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {AuthorityAtom} from '../models/authorityAtom.model'
import {AuthorityService} from '../services/authority.service'
import {KeycloakTokenKey, KeycloakTokenService} from '../services/keycloak-token.service'
import {Config} from '../models/config.model'

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

    constructor(
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private authorityService: AuthorityService,
        private tokenService: KeycloakTokenService
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

        this.moduleAuthorities = this.moduleAuthorities
            .sort((a, b) => a.course.abbreviation < b.course.abbreviation ? -1 : 1)
    }

    isAdmin(): boolean {
        return this.authorityService.isAdmin(this.roleAuthorities)
    }

    ngOnInit(): void {
        const systemId = this.tokenService.get(KeycloakTokenKey.SYSTEMID)

        this.authoritySub = this.authorityService.getAuthorities(systemId)
            .subscribe(this.unzipAuthorities.bind(this))
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener)
    }

    logout(): void {
        alert('logging out') // TODO
    }
}
