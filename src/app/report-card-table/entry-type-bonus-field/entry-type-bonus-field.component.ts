import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {reportCardEntryType, reportCardEntryTypeValue, updateReportCardEntryType} from '../report-card-table-functions'
import {FormControl} from '@angular/forms'
import {isNumber} from '../../models/time.model'
import {mapUndefined, subscribe} from '../../utils/functions'
import {isString} from '../../utils/type.check.utils'
import {ReportCardEntryTypeService} from '../../services/report-card-entry-type.service'
import {Subscription} from 'rxjs'

@Component({
    selector: 'lwm-entry-type-bonus-field',
    templateUrl: './entry-type-bonus-field.component.html',
    styleUrls: ['./entry-type-bonus-field.component.scss']
})
export class EntryTypeBonusFieldComponent implements OnInit, OnDestroy {

    fc: FormControl | undefined
    private subs: Subscription[]

    constructor(private readonly service: ReportCardEntryTypeService) {
        this.subs = []
    }

    @Input() entry: ReportCardEntryAtom
    @Input() attr: string

    ngOnInit(): void {
        this.createFormControl()
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private createFormControl = () => {
        const updateChanges = (fc: FormControl): (v: any) => void => v => {
            if (v !== null && v !== undefined && isNumber(v)) {
                fc.setValue(v, {emitEvent: false})
                const elem = reportCardEntryType(this.entry, this.attr)!
                const $ = updateReportCardEntryType(this.service, this.entry.labwork.course, {...elem, int: v})
                const s = subscribe($, t => {
                    this.entry.entryTypes = this.entry.entryTypes.map(x => x.id === t.id ? t : x)
                })

                this.subs.push(s)
            }
        }

        this.fc = mapUndefined(reportCardEntryTypeValue(this.entry, this.attr), v => {
            const fc = new FormControl(v.value)
            const s = subscribe(fc.valueChanges, updateChanges(fc))
            this.subs.push(s)

            return fc
        })

        // if (hasReportCardEntryTypeValue(this.entry, this.attr)) {
        //     this.fc = new FormControl(reportCardEntryTypeValue(this.entry, this.attr).value)
        //     const s = subscribe(this.fc.valueChanges, updateChanges(this.fc))
        //     this.subs.push(s)
        // }
    }

    private focusOut = (value: any, fc: FormControl) => {
        if (isString(value)) {
            fc.setValue(reportCardEntryTypeValue(this.entry, this.attr)?.value, {emitEvent: false})
        }
    }


}
