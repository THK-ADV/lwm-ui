import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {ReportCardEntryService} from '../../services/report-card-entry.service'
import {subscribe} from '../../utils/functions'
import {Subscription} from 'rxjs'
import {LabworkService} from '../../services/labwork.service'
import {updateLabwork$} from '../../labworks/labwork-view-model'

@Component({
    selector: 'lwm-closing',
    templateUrl: './closing.component.html',
    styleUrls: ['./closing.component.scss']
})
export class ClosingComponent implements OnInit {

    @Input() labwork: LabworkAtom
    @Output() labworkUpdate: EventEmitter<LabworkAtom>

    private headerTitle: string
    private reportCardEntriesCount: number
    private subs: Subscription[]

    constructor(
        private readonly reportCardEntryService: ReportCardEntryService,
        private readonly labworkService: LabworkService
    ) {
        this.reportCardEntriesCount = 0
        this.subs = []
        this.labworkUpdate = new EventEmitter<LabworkAtom>()
    }

    ngOnInit() {
        console.log('closing component loaded')

        this.headerTitle = `Abschluss für ${this.labwork.label}`
        this.subs.push(subscribe(
            this.reportCardEntryService.count(this.labwork.course.id, this.labwork.id),
            n => this.reportCardEntriesCount = n
        ))
    }

    private reportCardsAvailable = () => this.reportCardEntriesCount > 0

    private numberOfReportCards = () => this.reportCardEntriesCount

    private createReportCards = () => {
        // TODO
    }

    private reportCardPublished = () => this.labwork.published

    private publishReportCards = () => { // TODO test
        this.subs.push(
            subscribe(
                updateLabwork$(
                    this.labworkService,
                    this.labwork,
                    u => ({...u, published: true})
                ),
                l => {
                    this.labwork = l
                    this.labworkUpdate.emit(l)
                }
            )
        )
    }
}
