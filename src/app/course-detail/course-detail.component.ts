import { Component, OnInit, Input } from '@angular/core';
import { CourseAtom } from '../models/course.model';

@Component({
  selector: 'lwm-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent {

  @Input() course: CourseAtom

}
