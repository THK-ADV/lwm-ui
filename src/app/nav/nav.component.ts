import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthorityAtom } from '../models/authorityAtom.model';
import { AuthorityService } from '../services/authority.service';
import { KeycloakTokenKey, KeycloakTokenService } from '../services/keycloak-token.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  private authoritySub: Subscription
  private authorities: AuthorityAtom[]

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private authorityService: AuthorityService,
    private tokenService: KeycloakTokenService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    const systemId = this.tokenService.get(KeycloakTokenKey.SYSTEMID)
    this.authoritySub = this.authorityService.getAuthorities(systemId)
      .subscribe(authorities =>
        this.authorities = authorities
      )
  }




  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;



  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
