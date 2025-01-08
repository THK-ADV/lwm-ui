import {Component, OnDestroy, OnInit} from '@angular/core'
import {dateOrderingDESC} from '../../utils/functions'
import {EMPTY, Subscription} from 'rxjs'
import { HttpBackend, HttpClient } from '@angular/common/http'
import {format} from '../../utils/lwmdate-adapter'
import {catchError} from 'rxjs/operators'

interface ReleaseNote {
    date: Date
    dateLabel: string
    notes: string[]
    version: string
}

@Component({
    selector: 'lwm-release-notes',
    templateUrl: './release-notes.component.html',
    styleUrls: ['./release-notes.component.scss'],
    standalone: false
})
export class ReleaseNotesComponent implements OnInit, OnDestroy {
    private sub: Subscription
    private readonly http: HttpClient

    notes: ReleaseNote[] = []

    constructor(
        private readonly handler: HttpBackend
    ) {
        this.http = new HttpClient(handler)
    }

    ngOnInit(): void {
        this.sub = this.http.get('assets/release.json')
            .pipe(catchError(_ => EMPTY))
            .subscribe(this.updateUI)
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }

    private updateUI = (json: Object) => {
        this.notes = Object.values(json)
            .map<ReleaseNote>(a => {
                const date = new Date(a.date)

                return ({
                    version: a.version,
                    date: date,
                    notes: a.notes,
                    dateLabel: format(date, 'dd.MM.yyyy')
                })
            })
            .filter(a => a.notes.length > 0)
            .sort((a, b) => dateOrderingDESC(a.date, b.date))
    }
}
