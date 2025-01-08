import {Injectable} from '@angular/core'
import {Router} from '@angular/router'
import {KeycloakTokenService} from '../services/keycloak-token.service'

@Injectable()
export class DashboardGuard {

    constructor(
        private readonly tokenService: KeycloakTokenService,
        private readonly router: Router
    ) {
    }

    canActivate(): Promise<boolean> {
        const status = this.tokenService.getUserStatus()

        if (status === undefined) {
            return new Promise<boolean>(() => false)
        }

        switch (status) {
            case 'student':
                return this.router.navigate(['/s'])
            case 'employee':
            case 'lecturer':
                return this.router.navigate(['/e'])
        }
    }
}
