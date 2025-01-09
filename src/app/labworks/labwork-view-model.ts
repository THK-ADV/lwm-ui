import { LabworkService } from "../services/labwork.service"
import { LabworkAtom, LabworkProtocol } from "../models/labwork.model"
import { Observable } from "rxjs"

export const updateLabwork$ = (
  service: LabworkService,
  origin: Readonly<LabworkAtom>,
  update: (l: Readonly<LabworkAtom>) => Readonly<LabworkAtom>,
): Observable<LabworkAtom> => {
  const copy = { ...origin }
  return service.update(origin.course.id, toProtocol(update(copy)), origin.id)
}

export const toProtocol = (a: LabworkAtom): LabworkProtocol => ({
  label: a.label,
  course: a.course.id,
  degree: a.degree.id,
  semester: a.semester.id,
  published: a.published,
  subscribable: a.subscribable,
  description: a.description,
})
