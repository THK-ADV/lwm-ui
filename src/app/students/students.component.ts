import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ReportCardEntryAtom } from '../models/report-card-entry.model';
import { User } from './../models/user.model';
import { userAuths } from './../security/user-authority-resolver';
import { ReportCardEntryService } from './../services/report-card-entry.service';
import { UserService } from './../services/user.service';
import { formatUser } from './../utils/component.utils';
import { reportCardEntriesByCourseAndStudent$ } from './students-view-model';

@Component({
  selector: 'lwm-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

  private entries$: Observable<ReportCardEntryAtom[]>
  private student$: Observable<User>

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ReportCardEntryService,
    private readonly userService: UserService
  ) { }

  private const formatUser_ = formatUser

  ngOnInit() {
    const courseRelatedAuths = userAuths(this.route).filter(x => x.course !== undefined)

    this.student$ = this.route.paramMap.pipe(
      switchMap(params => this.userService.get(params.get('sid')!!))
    )

    this.entries$ = this.route.paramMap.pipe(
      switchMap(params => reportCardEntriesByCourseAndStudent$(this.service, courseRelatedAuths[0].course.id!!, params.get('sid')!!))
    )
  }  
}
