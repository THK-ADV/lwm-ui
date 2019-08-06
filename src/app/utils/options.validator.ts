import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms'

export const invalidChoiceKey = 'invalidObject'

export function optionsValidator(): ValidatorFn {
    return (ctl: AbstractControl): ValidationErrors | null => {
        if (!isJSON(ctl.value) || ctl.value === null || ctl.value === '') {
            return {[invalidChoiceKey]: 'Invalide Auswahl'}
        }

        return null
    }
}

export function isUserInput(value: any): boolean {
    return typeof value === 'string'
}

function isJSON(value: any): boolean {
    return !isUserInput(value)
}

