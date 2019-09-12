import {Observable} from 'rxjs'
import {ScheduleEntryService, SchedulePreview} from '../../services/schedule-entry.service'
import {LabworkAtom} from '../../models/labwork.model'

export interface MinMaxStrategy {
    kind: 'min-max'
    min: number
    max: number
}

export interface CountStrategy {
    kind: 'count'
    count: number
}

export interface SchedulePreviewConfig {
    strategy: GroupStrategy
    considerSemesterIndex: boolean
}

export type GroupStrategy = MinMaxStrategy | CountStrategy

export const fetchPreview = (
    service: ScheduleEntryService,
    labwork: LabworkAtom
): (config: SchedulePreviewConfig) => Observable<SchedulePreview> => {
    return config => service.preview(labwork.course.id, labwork.id, config.strategy, config.considerSemesterIndex)
}

