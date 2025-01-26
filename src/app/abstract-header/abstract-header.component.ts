import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core"
import {
  action,
  LWMAction,
  LWMActionType,
} from "../table-action-button/lwm-actions"

export interface ActionType {
  type: LWMActionType
  label: string | undefined
}

@Component({
  selector: "lwm-abstract-header",
  templateUrl: "./abstract-header.component.html",
  styleUrls: ["./abstract-header.component.scss"],
  standalone: false,
})
export class AbstractHeaderComponent implements OnInit {
  @Input() headerTitle: string
  @Input() actionTypes: ActionType[]

  @Output() performAction: EventEmitter<ActionType>

  actions_: { action: LWMAction; label: string | undefined }[]

  constructor() {
    this.performAction = new EventEmitter<ActionType>()
    this.actionTypes = []
    this.actions_ = []
  }

  ngOnInit(): void {
    this.actions_ = this.actionTypes.map((a) => ({
      action: action(a.type),
      label: a.label,
    }))
  }

  onClick = (a: { action: LWMAction; label: string | undefined }) =>
    this.performAction.emit({ type: a.action.type, label: a.label })
}
