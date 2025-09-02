import {ReportCardEntryType} from '../models/report-card-entry.model'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {EntryType, entryTypeSortingF} from '../models/assignment-plan.model'

export const distinctEntryTypeColumns = (types: ReportCardEntryType[]): TableHeaderColumn[] => {
    return Array
        .from(new Set<EntryType>(types.map(_ => _.entryType)))
        .sort(entryTypeSortingF)
        .map(x => ({attr: x, title: x}))
}
