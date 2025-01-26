import { FormDataStringType, FormInputData } from "./form.input"
import { ValidatorFn, Validators } from "@angular/forms"
import { Time } from "../../models/time.model"
import { localTimeValidator } from "../../utils/form.validator"
import { formatTime } from "../../utils/lwmdate-adapter"

export class FormInputTime implements FormInputData<string> {
  readonly type: FormDataStringType
  readonly validator: ValidatorFn | ValidatorFn[]
  readonly value: string

  constructor(value: Time | string) {
    if (value instanceof Time) {
      this.type = "text"
      this.validator = Validators.required
      this.value = formatTime(value)
    } else {
      this.type = "time"
      this.validator = localTimeValidator()
      this.value = value
    }
  }
}
