import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class EmployeeStatusGuard implements CanActivate {

  constructor(private keycloak: KeycloakService, private router: Router) {
  }

  canActivate(): Promise<boolean> {

    return new Promise<boolean>(async resolve => {


      const status = await this.keycloak.getKeycloakInstance().tokenParsed['status'];

      if (status === 'employee') {
        resolve(true);
      } else {
        this.router.navigate(['/']);
        resolve(false);
      }

    });

  }


}
