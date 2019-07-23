import {Component, OnInit} from '@angular/core'
import {Alert, AlertService} from '../services/alert.service'

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

    constructor(private alertService: AlertService) {
    }

    ngOnInit() {
    }

    alerts(): Alert[] {
        return this.alertService.getAlerts()
    }

    close(alert: Alert) {
        this.alertService.close(alert)
    }
}
