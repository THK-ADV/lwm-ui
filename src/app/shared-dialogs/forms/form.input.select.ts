import {FormDataStringType, FormInputData} from './form.input'
import {ValidatorFn, Validators} from '@angular/forms'

export class FormInputSelect implements FormInputData<string> {
    readonly type: FormDataStringType
    readonly validator: ValidatorFn | ValidatorFn[]
    readonly value: string
    readonly allValues: Array<string>

    constructor(
        value: string,
        allValues: Array<string>
    ) {
        this.type = 'select'
        this.validator = Validators.required
        this.value = value
        this.allValues = allValues
    }
}
