import { Observable } from 'rxjs';
import { ReportCardEntryService } from './../services/report-card-entry.service';
import { ReportCardEntryAtom } from '../models/report-card-entry.model';

export const reportCardEntriesByCourseAndStudent$ = (
    service: ReportCardEntryService,
    courseId: string,
    studentId: string
): Observable<ReportCardEntryAtom[]> => service.getAllWithFilter(courseId, {attribute: 'student', value: studentId})
