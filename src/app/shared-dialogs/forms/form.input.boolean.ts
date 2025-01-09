import { FormDataStringType, FormInputData } from "./form.input"
import { ValidatorFn, Validators } from "@angular/forms"

export class FormInputBoolean implements FormInputData<boolean> {
  readonly type: FormDataStringType
  readonly validator: ValidatorFn | ValidatorFn[]
  readonly value: boolean

  constructor(value: boolean) {
    this.validator = Validators.required
    this.type = "boolean"
    this.value = value
  }
}
