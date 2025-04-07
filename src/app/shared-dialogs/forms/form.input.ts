import { ValidatorFn } from '@angular/forms'
import { Time } from '../../models/time.model'

export type FormDataType = string | number | Date | Time | boolean

export type FormDataStringType =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'options'
  | 'textArea'
  | 'boolean'
  | 'select'

export interface FormInput {
  formControlName: string
  displayTitle: string
  isDisabled: boolean
  data: FormInputData<FormDataType>
}

export interface FormInputData<T extends FormDataType> {
  type: FormDataStringType
  validator: ValidatorFn | ValidatorFn[]
  value: T
}
