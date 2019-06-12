import { Injectable, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakTokenParsed } from 'keycloak-js';

export enum KeycloakTokenKey {
  SYSTEMID = "systemId"
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakTokenService {
  
  private token: KeycloakTokenParsed

  constructor(private keycloak: KeycloakService) { 
    this.token = this.keycloak.getKeycloakInstance().tokenParsed
  }

  get(key: KeycloakTokenKey): string {
    const value = this.token[key]

    return (value === undefined) ? "" : value;
  }
}
