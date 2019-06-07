import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export function keycloakInitializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: {
            url: environment.keycloak.authUrl,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientID,
            credentials: {
              secret: environment.keycloak.clientSecret
            }
          },
          initOptions: {
            onLoad: 'login-required',
            // onLoad: 'check-sso',
            checkLoginIframe: false
          },
          enableBearerInterceptor: true
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
