import {Component} from '@angular/core'
import {Creatable, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable} from 'rxjs'
import {Degree, DegreeProtocol} from '../models/degree.model'
import {DegreeService} from '../services/degree.service'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'

@Component({
    selector: 'lwm-degree',
    templateUrl: './degree.component.html',
    styleUrls: ['./degree.component.scss']
})
export class DegreeComponent {

    columns: TableHeaderColumn[]
    degrees$: Observable<Degree[]>
    creatable: Creatable<DegreeProtocol, Degree>

    constructor(private service: DegreeService) {
        this.columns = [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'abbreviation', title: 'Abkürzung'}
        ]

        this.degrees$ = service.getAll()
        this.creatable = {
            dialogTitle: 'Studiengang',
            emptyProtocol: () => ({label: '', abbreviation: ''}),
            makeInput: (attr, d) => {
                switch (attr) {
                    case 'label':
                        return {isDisabled: false, data: new FormInputString(d.label)}
                    case 'abbreviation':
                        return {isDisabled: isUniqueEntity(d), data: new FormInputString(d.abbreviation)}
                }
            },
            commitProtocol: (p, s) => ({...p, abbreviation: s?.abbreviation ?? p.abbreviation}),
            update: service.update
        }
    }
}
