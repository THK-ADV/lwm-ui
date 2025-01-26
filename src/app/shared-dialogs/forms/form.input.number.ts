import { ValidatorFn, Validators } from "@angular/forms"
import { FormDataStringType, FormInputData } from "./form.input"

export class FormInputNumber implements FormInputData<number> {
  readonly type: FormDataStringType
  readonly validator: ValidatorFn | ValidatorFn[]
  readonly value: number

  constructor(value: number) {
    this.type = "number"
    this.validator = [Validators.required, Validators.min(0)]
    this.value = value
  }
}
