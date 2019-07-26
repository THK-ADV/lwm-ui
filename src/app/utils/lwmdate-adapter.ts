import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from '@angular/material'

export const LWM_DATE_FORMATS = {
    display: {
        dateInput: 'dateInput',
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
                return date.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'})
            case LWM_DATE_FORMATS.display.monthYearLabel:
                return date.toLocaleDateString('de-DE', {month: 'short', year: 'numeric'})
            default:
                return super.format(date, displayFormat)
        }
    }
}
