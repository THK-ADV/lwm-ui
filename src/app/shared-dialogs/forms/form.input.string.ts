import { ValidatorFn, Validators } from "@angular/forms"
import { FormDataStringType, FormInputData } from "./form.input"

export class FormInputString implements FormInputData<string> {
  readonly type: FormDataStringType
  readonly validator: ValidatorFn | ValidatorFn[]
  readonly value: string

  constructor(value: string) {
    this.validator = Validators.required
    this.type = "text"
    this.value = value
  }
}

export class FormInputTextArea implements FormInputData<string> {
  readonly type: FormDataStringType
  readonly validator: ValidatorFn | ValidatorFn[]
  readonly value: string

  constructor(value: string) {
    this.validator = Validators.required
    this.type = "textArea"
    this.value = value
  }
}
