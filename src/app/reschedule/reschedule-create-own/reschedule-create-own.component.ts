import { Component, Input, OnInit } from "@angular/core"
import { FormControl, FormGroup, Validators } from "@angular/forms"
import { RoomService } from "../../services/room.service"
import { Observable } from "rxjs"
import { Room } from "../../models/room.model"
import { resetControls } from "../../utils/form-control-utils"

@Component({
  selector: "lwm-reschedule-create-own",
  templateUrl: "./reschedule-create-own.component.html",
  styleUrls: ["./reschedule-create-own.component.scss"],
  standalone: false,
})
export class RescheduleCreateOwnComponent implements OnInit {
  @Input() fg: FormGroup

  readonly startTimeControl: FormControl
  readonly endTimeControl: FormControl
  readonly roomControl: FormControl

  rooms$: Observable<Room[]>

  static createTimeFormControl = () =>
    new FormControl(undefined, [
      Validators.pattern("(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]"),
      Validators.required,
    ])

  constructor(private readonly roomService: RoomService) {
    this.startTimeControl = RescheduleCreateOwnComponent.createTimeFormControl()
    this.endTimeControl = RescheduleCreateOwnComponent.createTimeFormControl()
    this.roomControl = new FormControl(undefined, Validators.required)
    this.rooms$ = this.roomService.getAll()
  }

  ngOnInit(): void {
    this.fg.removeControl("start")
    this.fg.removeControl("end")
    this.fg.removeControl("room")

    this.fg.addControl("start", this.startTimeControl)
    this.fg.addControl("end", this.endTimeControl)
    this.fg.addControl("room", this.roomControl)

    resetControls([
      this.startTimeControl,
      this.endTimeControl,
      this.roomControl,
    ])
  }

  hasError = (fc: FormControl): boolean =>
    !fc.untouched && (fc.hasError("required") || fc.hasError("pattern"))

  getErrorMessage = (fc: FormControl): string => {
    switch (fc) {
      case this.startTimeControl:
      case this.endTimeControl:
        return "Muss im Format 'HH:mm' angegeben werden"
      case this.roomControl:
        return "Raum muss ausgewählt werden"
      default:
        return ""
    }
  }

  resetControls = () =>
    resetControls([
      this.startTimeControl,
      this.endTimeControl,
      this.roomControl,
    ])
}
