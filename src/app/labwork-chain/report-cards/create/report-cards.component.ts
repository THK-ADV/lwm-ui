import {Component, EventEmitter, Input, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {Subscription} from 'rxjs'
import {subscribe} from '../../../utils/functions'
import {LoadingService, withSpinning} from '../../../services/loading.service'

@Component({
    selector: 'lwm-report-cards',
    templateUrl: './report-cards.component.html',
    styleUrls: ['./report-cards.component.scss'],
    standalone: false
})
export class ReportCardsComponent {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() reportCards: Readonly<number>
    @Input() hasPermission: Readonly<boolean>

    @Output() labworkUpdate: EventEmitter<LabworkAtom>
    @Output() createReportCardEmitter: EventEmitter<number>

    private subs: Subscription[]

    constructor(
        private readonly reportCardEntryService: ReportCardEntryService,
        private readonly loadingService: LoadingService
    ) {
        this.labworkUpdate = new EventEmitter<LabworkAtom>()
        this.createReportCardEmitter = new EventEmitter<number>()
        this.subs = []
    }

    createReportCards = () => {
        const create$ = this.reportCardEntryService.create(this.labwork.course.id, this.labwork.id)
        const spinning = withSpinning<number>(this.loadingService)

        const s = subscribe(
            spinning(create$),
            xs => this.createReportCardEmitter.emit(xs)
        )

        this.subs.push(s)
    }

    reportCardsAvailable = () => this.reportCards > 0
}
