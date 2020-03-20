import {Injectable} from '@angular/core'
import {LWMError} from './http.service'

type AlertType =
    'success' |
    'info' |
    'warning' |
    'danger' |
    'primary' |
    'secondary' |
    'light' |
    'dark'

export interface Alert {
    type: AlertType
    message: string
}

@Injectable({
    providedIn: 'root'
})
export class AlertService { // TODO dismiss after a few seconds https://ng-bootstrap.github.io/#/components/alert/examples

    private alerts: Alert[]

    constructor() {
        this.reset()
    }

    reportAlert = (type: AlertType, message: string) =>
        this.alerts.push({type: type, message: message})

    reportLWMError = (error: LWMError) =>
        this.reportAlert('danger', `${error.message} (status: ${error.status})`)

    reportError = (error: Error) =>
        this.reportAlert('danger', error.message)

    getAlerts = (): Alert[] =>
        this.alerts

    close = (alert: Alert) =>
        this.alerts.splice(this.alerts.indexOf(alert), 1)

    reset = () =>
        this.alerts = []
}
