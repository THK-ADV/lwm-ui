import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms'
import {splitToNumbers} from '../models/time.model'

export const invalidChoiceKey = 'invalidObject'

export const invalidLocalTimeKey = 'invalidLocalTime'

export function isUserInput(value: any): boolean {
    return typeof value === 'string'
}

function isJSON(value: any): boolean {
    return !isUserInput(value)
}

export function mandatoryOptionsValidator(): ValidatorFn {
    return (ctl: AbstractControl): ValidationErrors | null => {
        if (!isJSON(ctl.value) || ctl.value === null || ctl.value === '') {
            return {[invalidChoiceKey]: 'Invalide Auswahl'}
        }

        return null
    }
}

export function optionalOptionsValidator(): ValidatorFn {
    return (ctl: AbstractControl): ValidationErrors | null => {
        if (ctl.value === '' || isJSON(ctl.value)) {
            return null
        }

        return {[invalidChoiceKey]: 'Invalide Auswahl'}
    }
}

export function localTimeValidator(): ValidatorFn {
    return (ctl: AbstractControl): ValidationErrors | null => {
        if (!isValidLocalTime(ctl.value) || ctl.value === null || ctl.value === '') {
            return {[invalidLocalTimeKey]: 'Die Uhrzeit muss im Format HH:mm angegeben werden'}
        }

        return null
    }
}

function isValidLocalTime(value: any): boolean {
    const split = splitToNumbers('' + value)
    return split.length >= 1 && split.length <= 3
}
