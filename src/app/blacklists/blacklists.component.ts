import {Component, OnInit} from '@angular/core'
import {AbstractCRUDComponent} from '../abstract-crud/abstract-crud.component'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {BlacklistService} from '../services/blacklist.service'
import {NotImplementedError} from '../utils/functions'
import {
    createGlobalBlacklistFromOutputData,
    emptyGlobalBlacklistProtocol,
    formatBlacklistTableEntry,
    globalBlacklistColumns,
    globalBlacklistInputData
} from './blacklist-view-model'

@Component({
    selector: 'app-blacklists',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class BlacklistsComponent extends AbstractCRUDComponent<BlacklistProtocol, Blacklist> implements OnInit {

    constructor(protected blacklistService: BlacklistService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            blacklistService,
            dialog,
            alertService,
            globalBlacklistColumns(),
            ['create', 'delete', 'update'],
            'label',
            'Globalen Blacklist',
            'Globale Blacklists',
            globalBlacklistInputData,
            model => model.label,
            formatBlacklistTableEntry,
            emptyGlobalBlacklistProtocol,
            () => undefined
        )
    }

    create = createGlobalBlacklistFromOutputData

    ngOnInit() {
        super.ngOnInit()
        this.fetchBlacklists()
    }

    fetchBlacklists() {
        const blacklists$ = this.blacklistService.getAllWithFilter({attribute: 'global', value: 'true'})
        this.fetchData(blacklists$)
    }

    update(model: Blacklist, updatedOutput: FormOutputData[]): BlacklistProtocol {
        return NotImplementedError() // TODO
    }
}
