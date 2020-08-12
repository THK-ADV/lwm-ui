import {Component, Input, OnInit} from '@angular/core'
import {FormControl} from '@angular/forms'
import {getLocalTimeErrorMessage, hasLocalTimeError, localTimeValidator} from '../../utils/form.validator'
import {Time} from '../../models/time.model'
import {formatTime} from '../../utils/lwmdate-adapter'
import {mapUndefined} from '../../utils/functions'

@Component({
    selector: 'lwm-time-input',
    templateUrl: './time-input.component.html',
    styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

    @Input() readonly placeholder: string
    @Input() readonly time: Time = Time.startOfTheDay()

    readonly formControl: FormControl

    constructor() {
        this.formControl = new FormControl(formatTime(this.time, 'HH:mm'), localTimeValidator())
    }

    ngOnInit(): void {
    }

    hasLocalTimeError = (): boolean =>
        hasLocalTimeError(this.formControl)

    getLocalTimeErrorMessage = (): string =>
        getLocalTimeErrorMessage(this.formControl)

    currentValue = (): Time | undefined => {
        if (!this.hasCurrentValue()) {
            return undefined
        }

        return this.formControl.value as Time
    }

    hasCurrentValue = (): boolean =>
        !(this.formControl.value === undefined || this.formControl.value === null || this.hasLocalTimeError())

    setCurrentValue = (time: Time | undefined) =>
        this.formControl.setValue(mapUndefined(time, t => formatTime(t, 'HH:mm')))

    setDisabled = (disabled: boolean) => {
        if (disabled) {
            this.formControl.disable()
        } else {
            this.formControl.enable()
        }
    }
}
