import {Injectable} from '@angular/core'
import {KeycloakService} from 'keycloak-angular'
import {mapUndefined} from '../utils/functions'

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

    get = (key: KeycloakTokenKey): string | undefined => mapUndefined(this.keycloak.getKeycloakInstance().tokenParsed, t => t[key])

    hasUserStatus = (status: KeycloakUserStatus): boolean => this.get(KeycloakTokenKey.STATUS) === status

    getUserStatus = (): KeycloakUserStatus => {
        return this.hasUserStatus(KeycloakUserStatus.STUDENT)
            ? KeycloakUserStatus.STUDENT
            : KeycloakUserStatus.EMPLOYEE // TODO hasStatus this sufficient enough?
    }
}
