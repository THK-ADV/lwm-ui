import {Component, EventEmitter, OnInit, Output} from '@angular/core'

@Component({
    selector: 'lwm-dashboard-calendar-settings',
    templateUrl: './dashboard-calendar-settings.component.html',
    styleUrls: ['./dashboard-calendar-settings.component.scss'],
    standalone: false
})
export class DashboardCalendarSettingsComponent implements OnInit {

    ownEntriesOnly: boolean
    toggleLabel: string

    @Output() ownEntriesOnlyChange = new EventEmitter<boolean>()

    constructor() {
        this.ownEntriesOnly = true // defaults to true
    }

    ngOnInit() {
        this.updateToggleLabel(this.ownEntriesOnly, false)
    }

    updateToggleLabel = (checked: boolean, emit: boolean) => {
        if (checked) {
            this.toggleLabel = 'Nur meine Termine anzeigen'
        } else {
            this.toggleLabel = 'Alle Termine anzeigen'
        }

        if (emit) {
            this.ownEntriesOnlyChange.emit(checked)
        }
    }
}
