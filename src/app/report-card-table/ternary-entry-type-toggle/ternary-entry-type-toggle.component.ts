import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {liftedTernaryState, ReportCardEntryTypeValue, reportCardEntryTypeValue} from '../report-card-table-functions'
import {ReportCardEntryTypeService} from '../../services/report-card-entry-type.service'
import {Subscription} from 'rxjs'

@Component({
    selector: 'lwm-ternary-entry-type-toggle',
    templateUrl: './ternary-entry-type-toggle.component.html',
    styleUrls: ['./ternary-entry-type-toggle.component.scss']
})
export class TernaryEntryTypeToggleComponent implements OnInit, OnDestroy {

    private subs: Subscription[] = []

    constructor(private readonly service: ReportCardEntryTypeService) {
    }

    @Input() entry: ReportCardEntryAtom
    @Input() attr: string

    value: ReportCardEntryTypeValue | undefined

    private onChange = (value: number, e: ReportCardEntryAtom, attr: string) => {
        console.log(liftedTernaryState(value), attr, e.id)
        // // force unwrapping is safe here, because the entryType is about to be changed right now
        // // tslint:disable-next-line:no-non-null-assertion
        // const entryType = reportCardEntryType(e, attr)!
        // const bool = liftedReportCardEntryTypeValue(value)
        // const $ = updateReportCardEntryType(this.service, this.entry.labwork.course, {...entryType, bool: bool})
        //
        // const s = subscribe($, t => {
        //     this.entry.entryTypes = this.entry.entryTypes.map(x => x.id === t.id ? t : x)
        // })
        //
        // this.subs.push(s)
    }

    ngOnInit(): void {
        this.value = reportCardEntryTypeValue(this.entry, this.attr)
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }
}
