import { Component, OnDestroy, OnInit } from "@angular/core"
import { Alert, AlertService } from "../services/alert.service"
import { Subscription } from "rxjs"
import { subscribe } from "../utils/functions"
import { debounceTime } from "rxjs/operators"

@Component({
  selector: "app-alert",
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.scss"],
  standalone: false,
})
export class AlertComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = []
  alerts: Alert[] = []

  constructor(private alertService: AlertService) {}

  close = (alert: Alert) => this.alerts.splice(this.alerts.indexOf(alert), 1)

  ngOnInit(): void {
    const alerts = this.alertService.alerts()

    this.subs.push(subscribe(alerts, (a) => this.alerts.push(a)))

    this.subs.push(
      subscribe(
        alerts.pipe(debounceTime(3000)), // wait 3 seconds until closing the alert
        (a) => this.close(a),
      ),
    )
  }

  ngOnDestroy() {
    this.subs.forEach((_) => _.unsubscribe())
  }
}
