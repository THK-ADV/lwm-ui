import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class StudentStatusGuard implements CanActivate {

  constructor(private keycloak: KeycloakService, private router: Router) {
  }

  canActivate(): Promise<boolean> {

    return new Promise<boolean>(async resolve => {

      const status = await this.keycloak.getKeycloakInstance().tokenParsed['status'];

      if (status === 'student') {
        resolve(true);
      } else {
        this.router.navigate(['/']);
        resolve(false);
      }

    });

  }


}
