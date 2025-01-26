import {
  AssignmentEntry,
  AssignmentEntryProtocol,
  EntryType,
} from "../../../models/assignment-plan.model"
import {
  DialogMode,
  dialogSubmitTitle,
  dialogTitle,
} from "../../../shared-dialogs/dialog.mode"
import {
  FormOutputData,
  FormPayload,
} from "../../../shared-dialogs/create-update/create-update-dialog.component"
import { FormInputString } from "../../../shared-dialogs/forms/form.input.string"
import { FormInputBoolean } from "../../../shared-dialogs/forms/form.input.boolean"
import { FormInputNumber } from "../../../shared-dialogs/forms/form.input.number"
import { exists, parseUnsafeBoolean } from "../../../utils/functions"
import { AssignmentEntriesService } from "../../../services/assignment-entries.service"
import { Observable } from "rxjs"
import { FormDataType } from "../../../shared-dialogs/forms/form.input"
import { switchMap } from "rxjs/operators"
import { fetchAssignmentEntries } from "../../labwork-chain-view-model"
import { LabworkAtom } from "../../../models/labwork.model"

export const assignmentEntryProtocol = (
  labwork: string,
): AssignmentEntryProtocol => ({
  labwork: labwork,
  label: "",
  duration: 1,
  types: [{ entryType: "Anwesenheitspflichtig" }],
})

export const assignmentEntryFormPayload = (
  mode: DialogMode,
  entry: Readonly<AssignmentEntryProtocol>,
  index: number,
): FormPayload<AssignmentEntryProtocol> => ({
  headerTitle: dialogTitle(mode, `Eintrag ${index + 1}`),
  submitTitle: dialogSubmitTitle(mode),
  data: formInputData(entry),
  makeProtocol: updateProtocol(entry),
})

const updateProtocol = (
  p: AssignmentEntryProtocol,
): ((data: FormOutputData[]) => AssignmentEntryProtocol) => {
  // tslint:disable-next-line:no-shadowed-variable
  const updateEntryTypeIfNeeded = (
    t: EntryType,
    p: AssignmentEntryProtocol,
    data: FormDataType,
  ) => {
    if (parseUnsafeBoolean(data)) {
      if (!exists(p.types, (x) => x.entryType === t)) {
        p.types.push({ entryType: t })
      }
    } else {
      p.types = p.types.filter((x) => x.entryType !== t)
    }
  }

  return (data) => {
    const label = labelFcName()
    const duration = durationFcName()
    const cert = certFcName()
    const bonus = bonusFcName()
    const supp = suppFcName()

    data.forEach((d) => {
      switch (d.attr) {
        case label:
          p[label] = d.value
          break
        case duration:
          p[duration] = d.value
          break
        case cert:
          updateEntryTypeIfNeeded("Testat", p, d.value)
          break
        case bonus:
          updateEntryTypeIfNeeded("Bonus", p, d.value)
          break
        case supp:
          updateEntryTypeIfNeeded("Zusatzleistung", p, d.value)
          break
        default:
          break
      }
    })

    return p
  }
}

const labelFcName = () => "label"

const durationFcName = () => "duration"

const certFcName = () => "certificate"

const suppFcName = () => "supplement"

const bonusFcName = () => "bonus"

const formInputData = (p: AssignmentEntryProtocol) => {
  const hasEntryType = (e: EntryType): boolean =>
    exists(p.types, (_) => _.entryType === e)

  return [
    {
      formControlName: labelFcName(),
      displayTitle: "Bezeichnung",
      isDisabled: false,
      data: new FormInputString(p.label),
    },
    {
      formControlName: certFcName(),
      displayTitle: "Testat",
      isDisabled: false,
      data: new FormInputBoolean(hasEntryType("Testat")),
    },
    {
      formControlName: bonusFcName(),
      displayTitle: "Bonusleistung",
      isDisabled: false,
      data: new FormInputBoolean(hasEntryType("Bonus")),
    },
    {
      formControlName: suppFcName(),
      displayTitle: "Zusatzleistung",
      isDisabled: false,
      data: new FormInputBoolean(hasEntryType("Zusatzleistung")),
    },
    {
      formControlName: durationFcName(),
      displayTitle: "Gruppenrotation",
      isDisabled: false,
      data: new FormInputNumber(p.duration),
    },
  ]
}

export const createAssignmentEntry$ = (
  courseId: string,
  service: AssignmentEntriesService,
): ((
  entry: Readonly<AssignmentEntryProtocol>,
) => Observable<AssignmentEntry>) => {
  return (entry) => service.create(courseId, entry)
}

export const takeoverAssignmentEntries$ = (
  courseId: string,
  service: AssignmentEntriesService,
  destLabworkId: Readonly<string>,
): ((src: Readonly<string>) => Observable<AssignmentEntry[]>) => {
  return (srcLabworkId) =>
    service.takeover(courseId, srcLabworkId, destLabworkId)
}

export const updateAssignmentEntry$ = (
  courseId: string,
  service: AssignmentEntriesService,
): ((entry: Readonly<AssignmentEntry>) => Observable<AssignmentEntry>) => {
  return (entry) => service.update(courseId, entry.id, entry)
}

export const deleteAndFetchAssignmentEntry$ = (
  labwork: LabworkAtom,
  service: AssignmentEntriesService,
): ((id: string) => Observable<AssignmentEntry[]>) => {
  return (id) =>
    service
      .delete(labwork.course.id, id)
      .pipe(switchMap((_) => fetchAssignmentEntries(service, labwork)))
}
