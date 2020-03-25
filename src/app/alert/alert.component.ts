import {Component, OnInit} from '@angular/core'
import {Alert, AlertService} from '../services/alert.service'

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

    constructor(private alertService: AlertService) {
    }

    alerts = (): Alert[] => this.alertService.getAlerts()

    close = (alert: Alert) => this.alertService.close(alert)
}
