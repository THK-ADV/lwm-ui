import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { Dashboard } from '../models/dashboard.model';
import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  SESSION_KEY = 'dashboard';


  constructor(private http: HttpClient, private keyCloak: KeycloakService, private dashboardService: DashboardService) { }

  async getSessionDashboard(forceReload: boolean = false): Promise<Dashboard> {

    const isLoggedIn = await this.keyCloak.isLoggedIn(); // can maybe deleted
    if (isLoggedIn) {

      const lsItem = localStorage.getItem(this.SESSION_KEY);

      return await this.dashboardService.getDashboardForCurrentSession();
    }



    return Promise.reject(new Error('fail'));
  }

}
