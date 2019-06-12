// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backendUrl: 'http://localhost', // 'http://lwivs18.gm.fh-koeln.de',
  backendPort: 9000,
  keycloak: {
    authUrl: 'https://auth.gm.fh-koeln.de/auth',
    realm: 'LWM',
    clientID: 'web_frontend_dev',
    clientSecret: 'f4592dea-9020-433d-8f65-b778139db4e4'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
