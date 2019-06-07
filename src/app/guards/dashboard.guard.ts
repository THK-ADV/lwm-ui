import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class DashboardGuard implements CanActivate {

  constructor(private keycloak: KeycloakService, private router: Router) {
  }

  canActivate(): Promise<any> {

    return new Promise<any>(async resolve => {

      const status = await this.keycloak.getKeycloakInstance().tokenParsed['status'];

      // insert UPDATE user with systemID to refresh data in keycloak
      switch (status) {
        case 'student': resolve(this.router.parseUrl('/s')); break;
        case 'employee': resolve(this.router.parseUrl('/e')); break;
        default: resolve(false);
      }

    });

  }


}
