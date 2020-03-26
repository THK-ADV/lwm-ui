import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom, ReportCardEntryType} from '../../models/report-card-entry.model'
import {ReportCardEntryTypeService} from '../../services/report-card-entry-type.service'
import {identity, Subscription} from 'rxjs'
import {foldUndefined, mapUndefined, subscribe} from '../../utils/functions'

enum TernaryState {
    passed = 3201,
    failed = 3202,
    neutral = 42
}

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
    @Input() canApprove: boolean

    state?: TernaryState

    private passed = TernaryState.passed
    private failed = TernaryState.failed
    private neutral = TernaryState.neutral

    private onChange = (value: number) => {
        const update$ = (t: ReportCardEntryType) =>
            this.service.update(this.entry.labwork.course, t.id, {...t, bool: this.fromNumber(value)})

        mapUndefined(
            this.currentType(),
            t => this.subs.push(subscribe(update$(t), identity))
        )
    }

    ngOnInit(): void {
        this.state = mapUndefined(
            this.currentType(),
            this.fromReportCardEntryType
        )
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private currentType = (): ReportCardEntryType | undefined =>
        this.entry.entryTypes.find(_ => _.entryType === this.attr)

    private fromReportCardEntryType = (t: ReportCardEntryType): TernaryState =>
        foldUndefined(t.bool, b => b ? TernaryState.passed : TernaryState.failed, () => TernaryState.neutral)

    private fromNumber = (n: number): boolean | undefined => {
        switch (n) {
            case this.passed:
                return true
            case this.failed:
                return false
            case this.neutral:
            default:
                return undefined
        }
    }
}
