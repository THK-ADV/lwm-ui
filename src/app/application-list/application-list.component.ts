import { Component, Input } from '@angular/core';
import { LabworkAtom } from '../models/labwork.model';

@Component({
  selector: 'lwm-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent {

  @Input() labworks: LabworkAtom[]
  @Input() isApplicant: (id:string) => boolean
}
