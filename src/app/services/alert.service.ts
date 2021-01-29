import {Injectable} from '@angular/core'
import {LWMError} from './http.service'
import {Html} from '../html-builder/html-builder'
import {Subject} from 'rxjs'

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
export class AlertService {

    private _alerts = new Subject<Alert>()

    constructor() {
    }

    alerts = () =>
        this._alerts.asObservable()

    reportAlert = (alert: Alert) =>
        this._alerts.next(alert)

    reportSuccess = (message: string) =>
        this.reportAlert({type: 'success', body: {kind: 'message', value: message}})

    reportLWMError = (error: LWMError) =>
        this.reportAlert({type: 'danger', body: {kind: 'message', value: `${error.message} (status: ${error.status})`}})

    reportError = (error: Error) =>
        this.reportAlert({type: 'danger', body: {kind: 'message', value: error.message}})
}
