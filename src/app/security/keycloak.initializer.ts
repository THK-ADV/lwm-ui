import { KeycloakService } from "keycloak-angular"
import { environment } from "../../environments/environment"

export function keycloakInitializer(
  keycloak: KeycloakService,
): () => Promise<any> {
  return (): Promise<any> => {
    return keycloak.init({
      config: {
        url: environment.keycloak.authUrl,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientID,
      },
      initOptions: {
        onLoad: "login-required",
        checkLoginIframe: false,
      },
      enableBearerInterceptor: true,
    })
  }
}
