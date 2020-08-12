import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from '@angular/forms'
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

export const localTimeValidator = (): ValidatorFn => {
    return (ctl: AbstractControl): ValidationErrors | null => {
        const validTime = isValidLocalTime(ctl.value)
        if (ctl.value === null || ctl.value === '' || !validTime) {
            return {[invalidLocalTimeKey]: 'Die Uhrzeit muss im Format HH:mm angegeben werden'}
        }
        return null
    }
}

export const hasLocalTimeError = (formControl: FormControl): boolean =>
    !formControl.untouched && formControl.hasError(invalidLocalTimeKey)

export const getLocalTimeErrorMessage = (formControl: FormControl): string =>
    formControl.getError(invalidLocalTimeKey)

const isValidHour = (hour: number) =>
    hour >= 0 && hour <= 24

const isValidMinute = (minute: number) =>
    minute >= 0 && minute <= 60

const isValidLocalTime = (value: any): boolean => {
    const split = splitToNumbers('' + value)

    switch (split.length) {
        case 0:
            return false
        case 1:
            return isValidHour(split[0])
        case 2:
            return isValidHour(split[0]) && isValidMinute(split[1])
        default:
            return false
    }
}
