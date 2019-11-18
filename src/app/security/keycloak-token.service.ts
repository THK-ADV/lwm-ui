import {Injectable} from '@angular/core'
import {KeycloakService} from 'keycloak-angular'

export enum KeycloakTokenKey {
    SYSTEMID = 'systemId',
    STATUS = 'status'
}

export enum KeycloakUserStatus {
    EMPLOYEE = 'employee',
    STUDENT = 'student'
}

@Injectable({
    providedIn: 'root'
})
export class KeycloakTokenService {

    constructor(private keycloak: KeycloakService) {
    }

    get(key: KeycloakTokenKey): string | undefined {
        const token = this.keycloak.getKeycloakInstance().tokenParsed

        if (token) {
            return token[key]
        } else {
            return undefined
        }
    }

    hasUserStatus(status: KeycloakUserStatus): boolean {
        return this.get(KeycloakTokenKey.STATUS) === status
    }

    getUserStatus(): KeycloakUserStatus {
        return this.hasUserStatus(KeycloakUserStatus.STUDENT)
            ? KeycloakUserStatus.STUDENT
            : KeycloakUserStatus.EMPLOYEE // TODO hasStatus this sufficient enough?
    }
}
