import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from '@angular/material'
import localDE from '@angular/common/locales/de'
import {formatDate, registerLocaleData} from '@angular/common'
import {Time} from '../models/time.model'

export const LWM_DATE_FORMATS = {
    display: {
        dateInput: 'localDate',
        monthYearLabel: 'monthYearLabel',
    }
}

export class LWMDateAdapter extends NativeDateAdapter {

    static defaultProviders() {
        return [
            {provide: DateAdapter, useClass: LWMDateAdapter},
            {provide: MAT_DATE_FORMATS, useValue: LWM_DATE_FORMATS},
        ]
    }

    format(date: Date, displayFormat: Object): string {
        switch (displayFormat) {
            case LWM_DATE_FORMATS.display.dateInput:
                return format(date, 'dd.MM.yyyy')
            case LWM_DATE_FORMATS.display.monthYearLabel:
                return date.toLocaleDateString('de-DE', {month: 'short', year: 'numeric'})
            default:
                return super.format(date, displayFormat)
        }
    }
}

export type DateTimePattern = 'yyyy-MM-dd' | 'dd.MM.yyyy' | 'HH:mm:ss'

export function format(date: Date, pattern: DateTimePattern): string {
    registerLocaleData(localDE, 'de')
    return formatDate(date, pattern, 'de')
}

export function formatTime(time: Time): string {
    return format(time.date, 'HH:mm:ss')
}
