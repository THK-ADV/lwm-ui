import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEvaluationPatternService} from '../../services/report-card-evaluation-pattern.service'
import {Creatable, Deletable, TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {Observable} from 'rxjs'
import {allPropertyTypes, ReportCardEvaluationPattern, ReportCardEvaluationPatternProtocol} from '../../models/report-card-evaluation'
import {FormInputString} from '../../shared-dialogs/forms/form.input.string'
import {FormInputNumber} from '../../shared-dialogs/forms/form.input.number'
import {allEntryTypes} from '../../models/assignment-plan.model'
import {FormInputSelect} from '../../shared-dialogs/forms/form.input.select'
import {isUniqueEntity} from '../../models/unique.entity.model'

@Component({
    selector: 'lwm-evaluation-pattern',
    templateUrl: './evaluation-pattern.component.html',
    styleUrls: ['./evaluation-pattern.component.scss']
})
export class EvaluationPatternComponent implements OnInit {

    @Input() labworkId: string
    @Input() courseId: string

    columns: TableHeaderColumn[]
    evalPatterns$: Observable<ReportCardEvaluationPattern[]>
    creatable: Creatable<ReportCardEvaluationPatternProtocol, ReportCardEvaluationPattern>
    deletable: Deletable<ReportCardEvaluationPattern>

    constructor(
        private readonly service: ReportCardEvaluationPatternService,
    ) {
        this.columns = [
            {title: 'Bezeichnung', attr: 'entryType'},
            {title: 'Basis', attr: 'property'},
            {title: 'Mindestens', attr: 'min'}
        ]
    }

    ngOnInit(): void {
        this.evalPatterns$ = this.service.getAll(this.courseId, this.labworkId)
        this.creatable = {
            dialogTitle: 'Kriterium',
            emptyProtocol: () => ({entryType: 'Testat', labwork: this.labworkId, min: 0, property: 'bool'}),
            makeInput: (attr, e) => {
                const uniqueEntity = isUniqueEntity(e)

                switch (attr) {
                    case 'entryType':
                        return {
                            isDisabled: uniqueEntity,
                            data: uniqueEntity ? new FormInputString(e.entryType) : new FormInputSelect(e.entryType, allEntryTypes())
                        }
                    case 'property':
                        return {
                            isDisabled: uniqueEntity,
                            data: uniqueEntity ? new FormInputString(e.property) : new FormInputSelect(e.property, allPropertyTypes())
                        }
                    case 'min':
                        return {isDisabled: false, data: new FormInputNumber(e.min)}
                }
            },
            commitProtocol: (p, s) => {
                const entryType = s?.entryType ?? p.entryType
                const property = s?.property ?? p.property

                return {
                    ...p,
                    entryType: entryType,
                    property: property
                }
            },
            create: p => this.service.create(p, this.courseId),
            update: (p, id) => this.service.update(p, id, this.courseId)
        }
        this.deletable = {
            titleForDialog: _ => _.entryType,
            delete: id => this.service.delete(id, this.courseId)
        }
    }
}
