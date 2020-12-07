import {Injectable} from '@angular/core'
import {CanActivate, Router} from '@angular/router'
import {KeycloakTokenService} from '../services/keycloak-token.service'
import {foldUndefined} from '../utils/functions'

@Injectable()
export class DashboardGuard implements CanActivate {

    constructor(private tokenService: KeycloakTokenService, private router: Router) {
    }

    canActivate(): Promise<boolean> {
        console.log('dashboard guard can activate')
        return foldUndefined(
            this.tokenService.getUserStatus(),
            status => {
                console.log(status)
                return new Promise<boolean>(() => false)
                // switch (status) {
                //     case 'student':
                //         return this.router.navigate(['/s'])
                //     case 'employee':
                //     case 'lecturer':
                //         return this.router.navigate(['/e'])
                // }
            },
            () => {
                console.log('status is undefined')
                return new Promise<boolean>(() => false)
            }
        )
    }
}
