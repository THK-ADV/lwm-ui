import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {Time} from '../models/time.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputDate} from '../shared-dialogs/forms/form.input.date'
import {FormInputTime} from '../shared-dialogs/forms/form.input.time'
import {isUniqueEntity} from '../models/unique.entity.model'
import {withCreateProtocol} from '../models/protocol.model'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {isFullDay} from '../labwork-chain/timetable-blacklists/timetable-blacklists-view-model'

export const localBlacklistsColumns = (): TableHeaderColumn[] => {
    return [
        ...globalBlacklistColumns(),
        {attr: 'start', title: 'Start'},
        {attr: 'end', title: 'Ende'}
    ]
}

export const globalBlacklistColumns = (): TableHeaderColumn[] => {
    return [
        {attr: 'label', title: 'Bezeichnung'},
        {attr: 'date', title: 'Datum'}
    ]
}

export const formatBlacklistTableEntry = (blacklist: Readonly<Blacklist>, attr: string): string => {
    const value = blacklist[attr]

    if (value instanceof Date) {
        return format(value, 'dd.MM.yyyy')
    } else if (value instanceof Time) {
        return isFullDay(blacklist) ? '-' : formatTime(value)
    } else {
        return value
    }
}

export const emptyGlobalBlacklistProtocol = (): BlacklistProtocol => {
    return {
        label: '',
        date: '',
        start: formatTime(Time.startOfTheDay()),
        end: formatTime(Time.endOfTheDay()),
        global: true
    }
}

export const emptyLocalBlacklistProtocol = (): BlacklistProtocol => {
    return {...emptyGlobalBlacklistProtocol(), global: false}
}


export const globalBlacklistInputData = (model: Readonly<BlacklistProtocol | Blacklist>, isModel: boolean): FormInput[] => {
    return [
        {
            formControlName: 'label',
            displayTitle: 'Bezeichnung',
            isDisabled: isModel,
            data: new FormInputString(model.label)
        },
        {
            formControlName: 'date',
            displayTitle: 'Datum',
            isDisabled: isModel,
            data: new FormInputDate(model.date)
        }
    ]
}

export const localBlacklistInputData = (model: Readonly<BlacklistProtocol | Blacklist>, isModel: boolean): FormInput[] => {
    return globalBlacklistInputData(model, isModel).concat(
        [
            {
                formControlName: 'start',
                displayTitle: 'Start',
                isDisabled: isModel,
                data: new FormInputTime(isUniqueEntity(model) ? model.start : Time.startOfTheDay())
            },
            {
                formControlName: 'end',
                displayTitle: 'Ende',
                isDisabled: isModel,
                data: new FormInputTime(isUniqueEntity(model) ? model.end : Time.endOfTheDay())
            }
        ]
    )
}

export const localBlacklistCreationInputData = (labelValue: string) => {
    const protocol = emptyLocalBlacklistProtocol()
    protocol.label = labelValue
    return localBlacklistInputData(protocol, false)
}

export const createGlobalBlacklistFromOutputData = (output: FormOutputData[]): BlacklistProtocol => {
    return withCreateProtocol(output, emptyGlobalBlacklistProtocol(), p => {
        p.date = format(new Date(p.date), 'yyyy-MM-dd')

        p.start = formatTime(Time.startOfTheDay())
        p.end = formatTime(Time.endOfTheDay())
        p.global = true
    })
}

export const createLocalBlacklistFromOutputData = (output: FormOutputData[]): BlacklistProtocol => {
    return withCreateProtocol(output, emptyGlobalBlacklistProtocol(), p => {
        const date = new Date(p.date)
        p.date = format(date, 'yyyy-MM-dd')

        p.start = formatTime(Time.fromTimeString(p.start, date))
        p.end = formatTime(Time.fromTimeString(p.end, date))
        p.global = false
    })
}
