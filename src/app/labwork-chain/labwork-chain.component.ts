import {Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {LabworkAtom} from '../models/labwork.model'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {subscribe} from '../utils/functions'
import {fetchLabwork} from '../utils/component.utils'

@Component({
    selector: 'lwm-labwork-chain',
    templateUrl: './labwork-chain.component.html',
    styleUrls: ['./labwork-chain.component.scss']
})
export class LabworkChainComponent implements OnInit, OnDestroy {

    private sub: Subscription
    private labwork: LabworkAtom

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService,
    ) {
    }

    ngOnInit() {
        console.log('chain loaded')

        this.sub = subscribe(fetchLabwork(this.route, this.labworkService), labwork => {
            this.labwork = labwork
        })
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }
}
