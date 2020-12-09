import {MediaMatcher} from '@angular/cdk/layout'
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core'
import {from, identity, Subscription} from 'rxjs'
import {AuthorityAtom} from '../models/authority.model'
import {Config} from '../models/config.model'
import {User} from '../models/user.model'
import {CourseAtom} from '../models/course.model'
import {KeycloakService} from 'keycloak-angular'
import {AlertService} from '../services/alert.service'
import {getInitials} from '../utils/component.utils'
import {isAdmin} from '../utils/role-checker'
import {ActivatedRoute, Router} from '@angular/router'
import {isEmpty, subscribe} from '../utils/functions'
import {switchMap} from 'rxjs/operators'

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

    @Input() authorities: AuthorityAtom[]

    private subs: Subscription[]
    readonly configs: Config[]

    moduleAuthorities: AuthorityAtom[]
    roleAuthorities: AuthorityAtom[]
    user: User

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly media: MediaMatcher,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly keycloakService: KeycloakService,
        private readonly alertService: AlertService,
    ) {
        this.subs = []
        this.moduleAuthorities = []
        this.roleAuthorities = []
        this.configs = Config.All()
        this.authorities = []

        this.mobileQuery = media.matchMedia('(max-width: 600px)')
        this._mobileQueryListener = () => changeDetectorRef.detectChanges()
        this.mobileQuery.addListener(this._mobileQueryListener)
    }

    readonly mobileQuery: MediaQueryList
    private readonly _mobileQueryListener: () => void

    ngOnInit() {
        this.unzipAuthorities()
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener)
        this.subs.forEach(v => v.unsubscribe())
    }

    private unzipAuthorities = () => {
        this.authorities.forEach(auth => {
            if (auth.course === undefined) {
                this.roleAuthorities.push(auth)
            } else {
                this.moduleAuthorities.push(auth)
            }
        })

        const first = this.authorities[0]
        if (first) {
            this.user = first.user
        }

        this.moduleAuthorities = this.moduleAuthorities
            .sort((a, b) => (a.course as CourseAtom).abbreviation < (b.course as CourseAtom).abbreviation ? -1 : 1)

        this.authorities = []
    }

    hasModuleAuthorities = () => !isEmpty(this.moduleAuthorities)

    isAdmin = (): boolean => isAdmin(this.roleAuthorities)

    getInitials = (): string => getInitials(this.user)

    logout = (): void => {
        const $ = from(this.router.navigate(['/'])).pipe(
            switchMap(x => from(this.keycloakService.logout()))
        )

        this.subs.push(subscribe($, identity))
    }

    linkClicked = () => {
        this.alertService.reset()
    }
}
