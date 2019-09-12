import {FormInput, FormInputData} from '../shared-dialogs/forms/form.input'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {AbstractControl, FormGroup} from '@angular/forms'

export const isOption = (d: FormInputData<any>): d is FormInputOption<any> => {
    return (d as FormInputOption<any>).bindOptions !== undefined
}

export const foreachOption = (inputs: FormInput[], f: (o: FormInputOption<any>) => void) => {
    inputs.forEach(d => {
        if (isOption(d.data)) {
            // @ts-ignore
            f(d.data)
        }
    })
}

export const hasOptionError = (formInputData: FormInputData<any>): boolean => {
    return isOption(formInputData) ? formInputData.hasError() : false
}

export const getOptionErrorMessage = (formInputData: FormInputData<any>): string => {
    return isOption(formInputData) ? formInputData.getErrorMessage() : ''
}

export const resetControls = (controls: Readonly<AbstractControl>[]) => {
    controls.forEach(resetControl)
}

export const resetControl = (control: Readonly<AbstractControl>) => {
    control.setValue('', {emitEvent: true})
    control.markAsUntouched()
}

export const printFormControlErrors = (formGroup: FormGroup) => {
    Object.keys(formGroup.controls).forEach(k => {
        console.error(k, formGroup.controls[k].errors)
    })
}
