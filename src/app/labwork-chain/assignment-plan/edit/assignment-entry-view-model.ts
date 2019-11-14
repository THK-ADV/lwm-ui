import {
    AssignmentEntry,
    AssignmentEntryProtocol,
    AssignmentEntryType,
    AssignmentEntryTypeValue,
    findEntryTypeValue
} from '../../../models/assignment-plan.model'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../../shared-dialogs/dialog.mode'
import {FormOutputData, FormPayload} from '../../../shared-dialogs/create-update/create-update-dialog.component'
import {FormInputString} from '../../../shared-dialogs/forms/form.input.string'
import {FormInputBoolean} from '../../../shared-dialogs/forms/form.input.boolean'
import {FormInputNumber} from '../../../shared-dialogs/forms/form.input.number'
import {exists, parseUnsafeBoolean} from '../../../utils/functions'
import {AssignmentEntriesService} from '../../../services/assignment-entries.service'
import {EMPTY, Observable, of} from 'rxjs'
import {FormDataType} from '../../../shared-dialogs/forms/form.input'
import {concatAll, mergeAll, switchMap, tap, toArray} from 'rxjs/operators'
import {fetchAssignmentEntries} from '../../labwork-chain-view-model'
import {LabworkAtom} from '../../../models/labwork.model'

export const assignmentEntryProtocol = (labwork: string): AssignmentEntryProtocol => ({
    labwork: labwork,
    label: '',
    duration: 1,
    types: [attendanceType()]
})

export const attendanceType = (): AssignmentEntryType => {
    return {entryType: AssignmentEntryTypeValue.attendance}
}

export const certType = (): AssignmentEntryType => {
    return {entryType: AssignmentEntryTypeValue.certificate}
}

export const suppType = (): AssignmentEntryType => {
    return {entryType: AssignmentEntryTypeValue.supplement}
}

export const bonusType = (): AssignmentEntryType => {
    return {entryType: AssignmentEntryTypeValue.bonus}
}

export const assignmentEntryFormPayload = (
    mode: DialogMode,
    entry: Readonly<AssignmentEntryProtocol>,
    index: number
): FormPayload<AssignmentEntryProtocol> => ({
    headerTitle: dialogTitle(mode, `Eintrag ${index + 1}`),
    submitTitle: dialogSubmitTitle(mode),
    data: formInputData(entry),
    makeProtocol: updateProtocol(entry)
})

const updateProtocol = (p: AssignmentEntryProtocol): (data: FormOutputData[]) => AssignmentEntryProtocol => {
    // tslint:disable-next-line:no-shadowed-variable
    const updateEntryTypeIfNeeded = (t: AssignmentEntryType, p: AssignmentEntryProtocol, data: FormDataType) => {
        if (parseUnsafeBoolean(data)) {
            if (!exists(p.types, x => x.entryType === t.entryType)) {
                p.types.push(t)
            }
        } else {
            p.types = p.types.filter(x => x.entryType !== t.entryType)
        }
    }

    return data => {
        const label = labelFcName()
        const duration = durationFcName()
        const cert = certFcName()
        const bonus = bonusFcName()
        const supp = suppFcName()

        data.forEach(d => {
            switch (d.formControlName) {
                case label:
                    p[label] = d.value
                    break
                case duration:
                    p[duration] = d.value
                    break
                case cert:
                    updateEntryTypeIfNeeded(certType(), p, d.value)
                    break
                case bonus:
                    updateEntryTypeIfNeeded(bonusType(), p, d.value)
                    break
                case supp:
                    updateEntryTypeIfNeeded(suppType(), p, d.value)
                    break
                default:
                    break
            }
        })

        return p
    }
}

const labelFcName = () => 'label'

const durationFcName = () => 'duration'

const certFcName = () => 'certificate'

const suppFcName = () => 'supplement'

const bonusFcName = () => 'bonus'

const formInputData = (p: AssignmentEntryProtocol) => [
    {
        formControlName: labelFcName(),
        displayTitle: 'Bezeichnung',
        isDisabled: false,
        data: new FormInputString(p.label)
    },
    {
        formControlName: certFcName(),
        displayTitle: 'Testat',
        isDisabled: false,
        data: new FormInputBoolean(!!findEntryTypeValue(p.types, AssignmentEntryTypeValue.certificate))
    },
    {
        formControlName: bonusFcName(),
        displayTitle: 'Bonusleistung',
        isDisabled: false,
        data: new FormInputBoolean(!!findEntryTypeValue(p.types, AssignmentEntryTypeValue.bonus))
    },
    {
        formControlName: suppFcName(),
        displayTitle: 'Zusatzleistung',
        isDisabled: false,
        data: new FormInputBoolean(!!findEntryTypeValue(p.types, AssignmentEntryTypeValue.supplement))
    },
    {
        formControlName: durationFcName(),
        displayTitle: 'Gruppenrotation',
        isDisabled: false,
        data: new FormInputNumber(p.duration)
    }
]

export const createAssignmentEntry$ = (
    courseId: string,
    service: AssignmentEntriesService
): (entry: Readonly<AssignmentEntryProtocol>) => Observable<AssignmentEntry> => {
    return entry => service.create(courseId, entry)
}

export const takeoverAssignmentEntries$ = (
    courseId: string,
    service: AssignmentEntriesService,
    destLabworkId: Readonly<string>
): (src: Readonly<string>) => Observable<AssignmentEntry[]> => {
    return srcLabworkId => service.takeover(courseId, srcLabworkId, destLabworkId)
}

export const updateAssignmentEntry$ = (
    courseId: string,
    service: AssignmentEntriesService
): (entry: Readonly<AssignmentEntry>) => Observable<AssignmentEntry> => {
    return entry => service.update(courseId, entry.id, entry)
}

export const deleteAndFetchAssignmentEntry$ = (
    labwork: LabworkAtom,
    service: AssignmentEntriesService
): (id: string) => Observable<AssignmentEntry[]> => {
    return id => service.delete(labwork.course.id, id).pipe(
        switchMap(_ => fetchAssignmentEntries(service, labwork))
    )
}
