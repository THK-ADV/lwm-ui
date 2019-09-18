import {Component, EventEmitter, Input, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {Subscription} from 'rxjs'

@Component({
    selector: 'lwm-report-cards',
    templateUrl: './report-cards.component.html',
    styleUrls: ['./report-cards.component.scss']
})
export class ReportCardsComponent {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() reportCards: Readonly<number>
    @Input() hasPermission: Readonly<boolean>

    @Output() labworkUpdate: EventEmitter<LabworkAtom>
    @Output() createReportCardEmitter: EventEmitter<number> // TODO

    private subs: Subscription[]

    constructor(
        private readonly reportCardEntryService: ReportCardEntryService,
    ) {
        this.labworkUpdate = new EventEmitter<LabworkAtom>()
        this.createReportCardEmitter = new EventEmitter<number>()
        this.subs = []
    }

    private createReportCards = () => {
        this.createReportCardEmitter.emit(42)
    }

    private reportCardsAvailable = () => this.reportCards > 0
}
