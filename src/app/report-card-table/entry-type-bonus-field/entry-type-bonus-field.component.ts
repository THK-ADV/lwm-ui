import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom, ReportCardEntryType} from '../../models/report-card-entry.model'
import {FormControl} from '@angular/forms'
import {ReportCardEntryTypeService} from '../../services/report-card-entry-type.service'
import {Subscription} from 'rxjs'
import {isNumber} from '../../models/time.model'
import {mapUndefined, subscribe} from '../../utils/functions'
import {isString} from '../../utils/type.check.utils'
import {distinctUntilChanged} from 'rxjs/operators'

@Component({
    selector: 'lwm-entry-type-bonus-field',
    templateUrl: './entry-type-bonus-field.component.html',
    styleUrls: ['./entry-type-bonus-field.component.scss']
})
export class EntryTypeBonusFieldComponent implements OnInit, OnDestroy {

    fc?: FormControl
    private subs: Subscription[]

    @Input() entry: ReportCardEntryAtom
    @Input() attr: string
    @Input() canApprove: boolean

    constructor(
        private readonly service: ReportCardEntryTypeService
    ) {
        this.subs = []
    }

    ngOnInit(): void {
        this.createFormControl()
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private createFormControl = () => {
        const updateChanges = (entry: Readonly<ReportCardEntryType>, v: number) => {
            const update$ = this.service.update(this.entry.labwork.course, entry.id, {...entry, int: v})
            const updateUI = (u: ReportCardEntryType) => this.entry.entryTypes = this.entry.entryTypes.map(x => x.id === u.id ? u : x)
            this.subs.push(subscribe(update$, updateUI))
        }

        const isValidNumber = (v: any): v is number =>
            v !== null && v !== undefined && isNumber(v)

        mapUndefined(
            this.maybeBonus(),
            entry => {
                this.fc = new FormControl(entry.int)
                const s = subscribe(this.fc.valueChanges.pipe(distinctUntilChanged()), v => {
                    if (isValidNumber(v)) {
                        updateChanges(entry, v)
                    }
                })
                this.subs.push(s)
            })
    }

    private maybeBonus = (): ReportCardEntryType | undefined =>
        this.entry.entryTypes.find(_ => _.entryType === this.attr)

    focusOut = (value: any, fc: FormControl) => {
        if (isString(value)) {
            fc.setValue(this.maybeBonus()?.int, {emitEvent: false})
        }
    }


}
