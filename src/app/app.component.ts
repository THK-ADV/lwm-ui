import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { KeycloakTokenService } from "./services/keycloak-token.service"
import { AuthorityService } from "./services/authority.service"
import { fetchCurrentUserAuthoritiesOrCreateNewUser$ } from "./utils/role-checker"
import { AuthorityAtom } from "./models/authority.model"
import { Observable } from "rxjs"
import { UserService } from "./services/user.service"
import { AlertService } from "./services/alert.service"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: false,
})
export class AppComponent {
  auths$: Observable<AuthorityAtom[]>

  constructor(
    private readonly router: Router,
    private readonly tokenService: KeycloakTokenService,
    private readonly authorityService: AuthorityService,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
  ) {
    this.auths$ = fetchCurrentUserAuthoritiesOrCreateNewUser$(
      authorityService,
      tokenService,
      userService,
      alertService,
    )
  }
}
