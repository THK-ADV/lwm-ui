import {Injectable} from '@angular/core'
import {CanActivate, Router, UrlTree} from '@angular/router'
import {KeycloakTokenService, KeycloakUserStatus} from '../services/keycloak-token.service'

@Injectable()
export class DashboardGuard implements CanActivate {

    constructor(private tokenService: KeycloakTokenService, private router: Router) {
    }

    canActivate(): Promise<UrlTree> {
        return new Promise<UrlTree>(resolve => {
            const status = this.tokenService.getUserStatus()

            // insert UPDATE user with systemID to refresh data in keycloak
            switch (status) {
                case KeycloakUserStatus.STUDENT:
                    resolve(this.router.parseUrl('/s'))
                    break
                case KeycloakUserStatus.EMPLOYEE:
                    resolve(this.router.parseUrl('/e'))
                    break
                default:
                    resolve(this.router.parseUrl('/'))
                    break
            }
        })
    }
}
