import {Component, Inject} from '@angular/core'
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {GroupStrategy, SchedulePreviewConfig} from '../group-preview-view-model'
import {mapUndefined, parseUnsafeBoolean, parseUnsafeNumber} from '../../../../utils/functions'

interface StrategyOption {
    value: string
    viewValue: string
}

@Component({
    selector: 'lwm-group-preview-modal',
    templateUrl: './group-preview-modal.component.html',
    styleUrls: ['./group-preview-modal.component.scss']
})
export class GroupPreviewModalComponent {

    formGroup: FormGroup
    readonly title: string
    readonly strategies: StrategyOption[]
    selectedValue: string

    private readonly countOption = ({value: 'count', viewValue: 'Gruppenanzahl'})
    private readonly minMaxOption = ({value: 'min-max', viewValue: 'Gruppengröße'})

    constructor(
        private dialogRef: MatDialogRef<GroupPreviewModalComponent, SchedulePreviewConfig>,
        @Inject(MAT_DIALOG_DATA) private applications: number
    ) {
        this.title = `${applications} Anmeldungen aufteilen nach`
        this.strategies = [this.countOption, this.minMaxOption]
        this.formGroup = new FormGroup({
            count: new FormControl(undefined),
            min: new FormControl(undefined),
            max: new FormControl(undefined),
            considerSemesterIndex: new FormControl(true, Validators.required)
        })

        this.formGroup.setValidators(this.strategyValidator())
    }

    static instance(
        dialog: MatDialog,
        applications: number
    ): MatDialogRef<GroupPreviewModalComponent, SchedulePreviewConfig> {
        return dialog.open<GroupPreviewModalComponent, number, SchedulePreviewConfig>(GroupPreviewModalComponent, {
            data: applications,
            panelClass: 'lwmGroupPreviewDialog'
        })
    }

    cancel = () => this.dialogRef.close(undefined)

    submit = () => {
        if (!this.formGroup.valid) {
            return
        }

        const strategy = this.foldSelectedValue<GroupStrategy | undefined>(
            count => ({kind: 'count', count: count}),
            (min, max) => ({kind: 'min-max', min: min, max: max}),
            () => undefined
        )

        this.dialogRef.close(mapUndefined(strategy, s => ({strategy: s, considerSemesterIndex: this.considerSemesterIndexValue()})))
    }

    hasError = (fcName: string) => !this.formGroup.controls[fcName].untouched && this.formGroup.controls[fcName].hasError(fcName)

    getErrorMsg = (fcName: string) => this.formGroup.controls[fcName].getError(fcName)

    considerSemesterIndexValue = () => parseUnsafeBoolean(this.formGroup.controls.considerSemesterIndex.value)

    private foldSelectedValue = <T>(count: (count: number) => T, minMax: (min: number, max: number) => T, nil: () => T): T => {
        if (!this.selectedValue) {
            return nil()
        }

        switch (this.selectedValue) {
            case this.countOption.value:
                return count(parseUnsafeNumber(this.formGroup.controls.count.value))
            case this.minMaxOption.value:
                return minMax(
                    parseUnsafeNumber(this.formGroup.controls.min.value),
                    parseUnsafeNumber(this.formGroup.controls.max.value)
                )
            default:
                return nil()
        }
    }

    private strategyValidator = (): ValidatorFn => {
        return (group: FormGroup) => {
            const countControl = group.controls.count
            const minControl = group.controls.min
            const maxControl = group.controls.max

            return this.foldSelectedValue<ValidationErrors | null>(
                count => {
                    minControl.setErrors(null)
                    maxControl.setErrors(null)

                    if (count > 0) {
                        countControl.setErrors(null)
                        return null
                    } else {
                        const err = {count: 'Anzahl muss größer als 0 sein'}
                        countControl.setErrors(err)
                        return err
                    }
                },
                (min, max) => {
                    countControl.setErrors(null)

                    if (min > 0 && min < max) {
                        minControl.setErrors(null)
                        maxControl.setErrors(null)
                        return null
                    } else {
                        const err = {max: 'Minimum muss größer als 0 und kleiner als Maximum sein'}
                        maxControl.setErrors(err)
                        return err
                    }
                },
                () => null
            )
        }
    }
}
