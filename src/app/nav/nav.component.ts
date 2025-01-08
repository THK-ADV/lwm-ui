import {MediaMatcher} from '@angular/cdk/layout'
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core'
import {from, identity, Subscription} from 'rxjs'
import {AuthorityAtom} from '../models/authority.model'
import {Config} from '../models/config.model'
import {User} from '../models/user.model'
import {CourseAtom} from '../models/course.model'
import {KeycloakService} from 'keycloak-angular'
import {getInitials} from '../utils/component.utils'
import {isAdmin} from '../utils/role-checker'
import {ActivatedRoute, Router} from '@angular/router'
import {partition, subscribe} from '../utils/functions'
import {switchMap} from 'rxjs/operators'
import {MiscLink, standardMiscLinks} from './misc-links'

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    standalone: false
})
export class NavComponent implements OnInit, OnDestroy {

    @Input() authorities: AuthorityAtom[]

    private sub: Subscription
    readonly configs: Config[]
    readonly miscLinks: MiscLink[]

    moduleAuthorities: AuthorityAtom[] = []
    user: User

    hasModuleAuthorities: boolean
    isAdmin: boolean
    initials: string

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly media: MediaMatcher,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly keycloakService: KeycloakService,
    ) {
        this.configs = Config.All()
        this.miscLinks = standardMiscLinks()

        this.mobileQuery = media.matchMedia('(max-width: 600px)')
        this._mobileQueryListener = () => changeDetectorRef.detectChanges()
        this.mobileQuery.addListener(this._mobileQueryListener)
    }

    readonly mobileQuery: MediaQueryList
    private readonly _mobileQueryListener: () => void

    ngOnInit() {
        this.updateUI()
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener)
        this.sub.unsubscribe()
    }

    private updateUI = () => {
        const [roleAuths, moduleAuths] = partition(this.authorities, a => a.course === undefined)

        this.user = this.authorities[0].user

        this.moduleAuthorities = moduleAuths
            .sort((a, b) => (a.course as CourseAtom).abbreviation.localeCompare((b.course as CourseAtom).abbreviation))

        this.hasModuleAuthorities = this.moduleAuthorities.length > 0
        this.isAdmin = isAdmin(roleAuths)
        this.initials = getInitials(this.user)
    }

    logout = (): void => {
        this.sub = subscribe(
            from(this.router.navigate(['/']))
                .pipe(switchMap(_ => from(this.keycloakService.logout()))),
            identity
        )
    }

    openLink = (link: MiscLink) => {
        switch (link.url.kind) {
            case 'internal':
                this.router.navigate([link.url.path])
                break
            case 'external':
                window.open(link.url.path, '_blank')
                break
        }
    }
}
