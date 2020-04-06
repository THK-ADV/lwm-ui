import {Injectable} from '@angular/core'
import {CanActivate, Router} from '@angular/router'
import {KeycloakTokenService} from '../services/keycloak-token.service'

@Injectable()
export class EmployeeStatusGuard implements CanActivate {

    constructor(private tokenService: KeycloakTokenService, private router: Router) {
    }

    canActivate(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const isEmployee = this.tokenService.hasUserStatus('employee') ||
                this.tokenService.hasUserStatus('lecturer')

            if (!isEmployee) {
                this.router.navigate(['/'])
            }

            resolve(isEmployee)
        })
    }
}
