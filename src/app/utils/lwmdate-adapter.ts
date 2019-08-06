import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from '@angular/material'
import localDE from '@angular/common/locales/de'
import {formatDate, registerLocaleData} from '@angular/common'

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
                return format(date, 'dd.MM.yy')
            case LWM_DATE_FORMATS.display.monthYearLabel:
                return date.toLocaleDateString('de-DE', {month: 'short', year: 'numeric'})
            default:
                return super.format(date, displayFormat)
        }
    }
}

export type DatePattern = 'yyyy-MM-dd' | 'dd.MM.yy'

export function format(date: Date, pattern: DatePattern): string {
    registerLocaleData(localDE, 'de')
    return formatDate(date, pattern, 'de')
}
