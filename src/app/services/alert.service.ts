import {Injectable} from '@angular/core'
import {LWMError} from './http.service'
import {Html} from '../html-builder/html-builder'

type AlertType =
    'success' |
    'info' |
    'warning' |
    'danger' |
    'primary' |
    'secondary' |
    'light' |
    'dark'

interface Message {
    kind: 'message'
    value: string
}

type AlertBody = Message | Html

export interface Alert {
    type: AlertType
    body: AlertBody
}

@Injectable({
    providedIn: 'root'
})
export class AlertService { // TODO dismiss after a few seconds https://ng-bootstrap.github.io/#/components/alert/examples

    private alerts: Alert[]

    constructor() {
        this.reset()
    }

    reportAlert = (alert: Alert) =>
        this.alerts.push(alert)

    reportSuccess = (message: string) =>
        this.reportAlert({type: 'success', body: {kind: 'message', value: message}})

    reportLWMError = (error: LWMError) =>
        this.reportAlert({type: 'danger', body: {kind: 'message', value: `${error.message} (status: ${error.status})`}})

    reportError = (error: Error) =>
        this.reportAlert({type: 'danger', body: {kind: 'message', value: error.message}})

    getAlerts = (): Alert[] =>
        this.alerts

    close = (alert: Alert) =>
        this.alerts.splice(this.alerts.indexOf(alert), 1)

    reset = () =>
        this.alerts = []
}
