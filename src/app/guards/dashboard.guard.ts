import {Injectable} from '@angular/core'
import {CanActivate, Router} from '@angular/router'
import {KeycloakTokenService} from '../services/keycloak-token.service'
import {foldUndefined} from '../utils/functions'

@Injectable()
export class DashboardGuard implements CanActivate {

    constructor(private tokenService: KeycloakTokenService, private router: Router) {
    }

    canActivate(): Promise<boolean> {
        return foldUndefined(
            this.tokenService.getUserStatus(),
            status => {
                switch (status) {
                    case 'student':
                        return this.router.navigate(['/s'])
                    case 'employee':
                    case 'lecturer':
                        return this.router.navigate(['/e'])
                }
            },
            () => new Promise<boolean>(() => false)
        )
    }
}
