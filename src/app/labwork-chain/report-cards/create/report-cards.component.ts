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

    @Output() labworkUpdate: EventEmitter<LabworkAtom>

    private subs: Subscription[]

    constructor(
        private readonly reportCardEntryService: ReportCardEntryService,
    ) {
        this.labworkUpdate = new EventEmitter<LabworkAtom>()
        this.subs = []
    }

    private createReportCards = () => {
        // TODO
    }

    private canEdit = () => true // todo permission check

    private reportCardsAvailable = () => this.reportCards > 0
}
