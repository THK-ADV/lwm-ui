import { Component, OnInit } from "@angular/core"
import { LoadingService } from "../services/loading.service"

@Component({
  selector: "lwm-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
  standalone: false,
})
export class ProgressBarComponent implements OnInit {
  constructor(private readonly service: LoadingService) {}

  ngOnInit() {}

  isLoading = (): boolean => this.service.isSpinning()
}
