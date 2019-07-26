import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from '@angular/material'

type DateFormat = 'localDate'

export const LWM_DATE_FORMATS = {
    display: {
        dateInput: 'localDate',
        monthYearLabel: 'monthYearLabel',
    }
}

export class LWMDateAdapter extends NativeDateAdapter {

    static format(date: Date, format: DateFormat): string {
        switch (format) {
            case 'localDate':
                return date.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'})
        }
    }

    static defaultProviders() {
        return [
            {provide: DateAdapter, useClass: LWMDateAdapter},
            {provide: MAT_DATE_FORMATS, useValue: LWM_DATE_FORMATS},
        ]
    }

    format(date: Date, displayFormat: Object): string {
        switch (displayFormat) {
            case LWM_DATE_FORMATS.display.dateInput:
                return LWMDateAdapter.format(date, 'localDate')
            case LWM_DATE_FORMATS.display.monthYearLabel:
                return date.toLocaleDateString('de-DE', {month: 'short', year: 'numeric'})
            default:
                return super.format(date, displayFormat)
        }
    }
}
