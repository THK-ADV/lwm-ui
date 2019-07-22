import {Injectable} from '@angular/core'
import {LWMError} from './http.service'

type AlertType = 'success' | 'info' | 'warning' | 'danger'

export interface Alert {
    type: AlertType
    message: string
}

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    private alerts: Alert[]

    constructor() {
        this.reset()
    }

    addAlert(type: AlertType, message: string) {
        this.alerts.push({type: type, message: message})
    }

    reportError(error: LWMError) {
        this.addAlert('danger', `${error.message} (status: ${error.status})`)
    }

    getAlerts(): Alert[] {
        return this.alerts
    }

    close(alert: Alert) {
        this.alerts.splice(this.alerts.indexOf(alert), 1)
    }

    reset() {
        this.alerts = []
    }
}
