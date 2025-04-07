import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { KeycloakTokenService } from '../services/keycloak-token.service'

@Injectable()
export class StudentStatusGuard {
  constructor(
    private tokenService: KeycloakTokenService,
    private router: Router,
  ) {}

  canActivate(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const isStudent = this.tokenService.hasUserStatus('student')

      if (!isStudent) {
        this.router.navigate(['/'])
      }

      resolve(isStudent)
    })
  }
}
