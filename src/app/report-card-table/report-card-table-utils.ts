import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {entryTypeSortingF} from '../models/assignment-plan.model'
import {EntryType} from '../models/entry-type'
import {ReportCardEntryType} from '../models/report-card-entry-type'

export const distinctEntryTypeColumns = (types: ReportCardEntryType[]): TableHeaderColumn[] => {
    return Array
        .from(new Set<EntryType>(types.map(_ => _.entryType)))
        .sort(entryTypeSortingF)
        .map(x => ({attr: x, title: x}))
}
