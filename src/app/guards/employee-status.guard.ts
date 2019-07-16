import {Injectable} from '@angular/core'
import {CanActivate, Router} from '@angular/router'
import {KeycloakTokenService, KeycloakUserStatus} from '../services/keycloak-token.service'

@Injectable()
export class EmployeeStatusGuard implements CanActivate {

    constructor(private tokenService: KeycloakTokenService, private router: Router) {
    }

    canActivate(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const isEmployee = this.tokenService.hasUserStatus(KeycloakUserStatus.EMPLOYEE)

            if (!isEmployee) {
                this.router.navigate(['/'])
            }

            resolve(isEmployee)
        })
    }
}
