import {FormDataStringType, FormInputData} from './form.input'
import {ValidatorFn, Validators} from '@angular/forms'

export class FormInputDate implements FormInputData<Date | string> {
    readonly type: FormDataStringType
    readonly validator: ValidatorFn | ValidatorFn[]
    readonly value: Date | string

    constructor(
        value: Date | string
    ) {
        this.type = 'date'
        this.validator = Validators.required
        this.value = value
    }
}
