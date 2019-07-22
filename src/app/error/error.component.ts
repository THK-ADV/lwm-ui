import {Component, OnInit} from '@angular/core'
import {Alert, AlertService} from '../services/alert.service'

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

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
