import {Component, OnInit} from '@angular/core'
import {AbstractCRUDComponent} from '../abstract-crud/abstract-crud.component'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {NotImplementedError} from '../utils/functions'
import {ActivatedRoute} from '@angular/router'

@Component({
    selector: 'app-labwork-applications',
    templateUrl: './labwork-applications.component.html',
    styleUrls: ['./labwork-applications.component.scss']
})
export class LabworkApplicationsComponent implements OnInit /*extends AbstractCRUDComponent<LabworkApplicationProtocol, LabworkApplicationAtom>*/ {

    constructor(private readonly route: ActivatedRoute) {

    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(console.log)
    }

    // create(output: FormOutputData[]): LabworkApplicationProtocol {
    //     return NotImplementedError()
    // }
    //
    // update(model: LabworkApplicationAtom, updatedOutput: FormOutputData[]): LabworkApplicationProtocol {
    //     return NotImplementedError()
    // }
}
