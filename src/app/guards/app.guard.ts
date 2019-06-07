import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AppGuard implements CanActivate {

  bed = false;

  constructor(private login: KeycloakService, private router: Router) {
  }

  canActivate() {
    if (this.login.isLoggedIn()) {
      // check user status and redirect

      // this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }


}
