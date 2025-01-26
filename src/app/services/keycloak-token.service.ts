import { Injectable } from "@angular/core"
import { KeycloakService } from "keycloak-angular"
import { mapUndefined } from "../utils/functions"

export type KeycloakTokenKey = "systemId" | "status"

export type KeycloakUserStatus = "employee" | "student" | "lecturer"

@Injectable({
  providedIn: "root",
})
export class KeycloakTokenService {
  constructor(private keycloak: KeycloakService) {}

  get = (key: KeycloakTokenKey): string | undefined =>
    mapUndefined(this.keycloak.getKeycloakInstance().tokenParsed, (t) => t[key])

  hasUserStatus = (status: KeycloakUserStatus): boolean =>
    this.get("status") === status

  getUserStatus = (): KeycloakUserStatus | undefined => {
    const status = this.get("status")

    if (!status) {
      return undefined
    }

    switch (status) {
      case "student":
        return "student"
      case "employee":
        return "employee"
      case "lecturer":
        return "lecturer"
      default:
        return undefined
    }
  }
}
