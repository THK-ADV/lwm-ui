import {TooltipPosition} from '@angular/material'
import {LWMColor} from '../utils/colors'

export type LWMActionType =
    'edit' |
    'delete' |
    'chain' |
    'groups' |
    'graduates' |
    'applications' |
    'create' |
    'swap' |
    'preview' |
    'upload' |
    'sync' |
    'download' |
    'evaluate' |
    'reportCardEntryType' |
    'fire' |
    'honor'

export interface LWMAction {
    type: LWMActionType
    color: LWMColor
    iconName: string
    tooltipName: string
    tooltipPosition: TooltipPosition
}

export const chainAction = (): LWMAction => {
    return {type: 'chain', color: 'primary', iconName: 'schedule', tooltipName: 'Staffelplan', tooltipPosition: 'above'}
}

export const labworkApplicationAction = (): LWMAction => {
    return {type: 'applications', color: 'accent', iconName: 'assignment_ind', tooltipName: 'Anmeldungen', tooltipPosition: 'above'}
}

export const groupAction = (): LWMAction => {
    return {type: 'groups', color: 'accent', iconName: 'group', tooltipName: 'Gruppen', tooltipPosition: 'above'}
}

export const graduatesAction = (): LWMAction => {
    return {type: 'graduates', color: 'accent', iconName: 'school', tooltipName: 'Absolventen', tooltipPosition: 'above'}
}

export const editAction = (): LWMAction => {
    return {type: 'edit', color: 'accent', iconName: 'edit', tooltipName: 'Bearbeiten', tooltipPosition: 'above'}
}

export const deleteAction = (): LWMAction => {
    return {type: 'delete', color: 'warn', iconName: 'delete', tooltipName: 'Löschen', tooltipPosition: 'above'}
}

export const createAction = (): LWMAction => {
    return {type: 'create', color: 'primary', iconName: 'add', tooltipName: 'Hinzufügen', tooltipPosition: 'above'}
}

export const swapAction = (): LWMAction => {
    return {type: 'swap', color: 'primary', iconName: 'swap_horiz', tooltipName: 'Wechseln', tooltipPosition: 'above'}
}

export const previewAction = (): LWMAction => {
    return {type: 'preview', color: 'accent', iconName: 'autorenew', tooltipName: 'Vorschau', tooltipPosition: 'above'}
}

export const uploadAction = (): LWMAction => {
    return {type: 'upload', color: 'accent', iconName: 'cloud_upload', tooltipName: 'Übernehmen', tooltipPosition: 'above'}
}

export const downloadAction = (): LWMAction => {
    return {type: 'download', color: 'accent', iconName: 'cloud_download', tooltipName: 'Herunterladen', tooltipPosition: 'above'}
}

export const syncAction = (): LWMAction => {
    return {type: 'sync', color: 'primary', iconName: 'sync', tooltipName: 'Mit LDAP abgleichen', tooltipPosition: 'above'}
}

export const evaluateAction = (): LWMAction => {
    return {type: 'evaluate', color: 'primary', iconName: 'school', tooltipName: 'Notenhefte evaluieren', tooltipPosition: 'above'}
}

export const reportCardEntryTypeAction = (): LWMAction => ({
    type: 'reportCardEntryType',
    color: 'accent',
    iconName: 'assignment_turned_in',
    tooltipName: 'Abnahmen vergeben',
    tooltipPosition: 'above'
})


export const fireAction = (): LWMAction => ({
    type: 'fire',
    color: 'warn',
    iconName: 'local_fire_department',
    tooltipName: 'Sofort durchgefallen',
    tooltipPosition: 'above'
})

export const honorAction = (): LWMAction => ({
    type: 'honor',
    color: 'accent',
    iconName: 'emoji_events',
    tooltipName: 'Sofort bestanden',
    tooltipPosition: 'above'
})

export const action = (type: LWMActionType): LWMAction => {
    switch (type) {
        case 'edit':
            return editAction()
        case 'delete':
            return deleteAction()
        case 'chain':
            return chainAction()
        case 'groups':
            return groupAction()
        case 'graduates':
            return graduatesAction()
        case 'applications':
            return labworkApplicationAction()
        case 'create':
            return createAction()
        case 'swap':
            return swapAction()
        case 'preview':
            return previewAction()
        case 'upload':
            return uploadAction()
        case 'sync':
            return syncAction()
        case 'download':
            return downloadAction()
        case 'evaluate':
            return evaluateAction()
        case 'reportCardEntryType':
            return reportCardEntryTypeAction()
        case 'fire':
            return fireAction()
        case 'honor':
            return honorAction()
    }
}
