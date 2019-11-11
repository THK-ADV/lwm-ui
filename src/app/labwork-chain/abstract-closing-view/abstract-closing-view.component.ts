import {Component, EventEmitter, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {Subscription} from 'rxjs'
import {LabworkService} from '../../services/labwork.service'
import {subscribe} from '../../utils/functions'
import {updateLabwork$} from '../../labworks/labwork-view-model'

@Component({
    selector: 'lwm-abstract-closing-view',
    templateUrl: './abstract-closing-view.component.html',
    styleUrls: ['./abstract-closing-view.component.scss']
})
export class AbstractClosingViewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() titlePrefix: Readonly<string>
    @Input() reportCardsAvailable: Readonly<boolean>
    @Input() labworkUpdate: EventEmitter<LabworkAtom>
    @Input() hasPermission: Readonly<boolean>

    private headerTitle: string
    private subs: Subscription[]

    constructor(
        private readonly labworkService: LabworkService
    ) {
        this.subs = []
    }

    ngOnInit() {
        console.log('report-cards component loaded')

        this.headerTitle = `${this.titlePrefix} für ${this.labwork.label}`
    }

    private reportCardPublished = () => this.labwork.published

    private publishReportCards = () => {
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
