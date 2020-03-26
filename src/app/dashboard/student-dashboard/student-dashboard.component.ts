import { Component, OnInit } from '@angular/core'
import { DashboardService } from '../../services/dashboard.service'
import { StudentDashboard } from '../../models/dashboard.model'
import { Observable } from 'rxjs'
import { formatUser } from '../../utils/component.utils'
import { SemesterJSON } from 'src/app/models/semester.model'
import { LabworkService } from 'src/app/services/labwork.service'
import { switchMap, map, tap } from 'rxjs/operators'
import { mapLabworkJSON, convertManyReportCardEntries } from 'src/app/utils/http-utils'
import { LabworkAtomJSON, LabworkAtom } from 'src/app/models/labwork.model'

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

  dashboard$: Observable<StudentDashboard>
  labworks: LabworkAtom[]

  constructor(private readonly service: DashboardService, private readonly labworkService: LabworkService) { }

  ngOnInit() {
    this.dashboard$ = this.service.getStudentDashboard().pipe(
      map(x => ({
        ...x, labworks: [
          mapLabworkJSON({
            'label': 'Test',
            'description': 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
            'semester': {
              'label': 'Somersemester 2020',
              'abbreviation': 'SoSe 20',
              'start': '2020-03-01',
              'end': '2020-08-31',
              'examStart': '2020-09-01',
              'id': '71e9d1c7-f698-4ae8-945a-c4dfdb45ab96'
            },
            'course': {
              'label': '',
              'description': 'Dinge, und noch mehr Tolle Dinge',
              'abbreviation': 'FSIOS',
              'lecturer': {
                'systemId': 'dobrynin',
                'lastname': 'Dobrynin',
                'firstname': 'Alexander',
                'email': 'alexander.dobrynin@th-koeln.de',
                'id': 'c04e5fc9-d188-420b-8ed7-9e92480b765e'
              },
              'semesterIndex': 3,
              'id': '0431b5ad-3433-4430-a0ce-7d927cf5fea7'
            },
            'degree': {
              'label': 'Medieninformatik (Bachelor)',
              'abbreviation': 'MI',
              'id': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd'
            },
            'subscribable': true,
            'published': true,
            'id': '8f999abd-476d-4c3d-bb64-6b48c8395035'
          }),
          mapLabworkJSON({
            'label': 'AP2',
            'description': 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.',
            'semester': {
              'label': 'Somersemester 2020',
              'abbreviation': 'SoSe 20',
              'start': '2020-03-01',
              'end': '2020-08-31',
              'examStart': '2020-09-01',
              'id': '71e9d1c7-f698-4ae8-945a-c4dfdb45ab96'
            },
            'course': {
              'label': '',
              'description': 'Dinge, und noch mehr Tolle Dinge',
              'abbreviation': 'FSIOS',
              'lecturer': {
                'systemId': 'dobrynin',
                'lastname': 'Dobrynin',
                'firstname': 'Alexander',
                'email': 'alexander.dobrynin@th-koeln.de',
                'id': 'c04e5fc9-d188-420b-8ed7-9e92480b765e'
              },
              'semesterIndex': 3,
              'id': '0431b5ad-3433-4430-a0ce-7d927cf5fea7'
            },
            'degree': {
              'label': 'Medieninformatik (Bachelor)',
              'abbreviation': 'MI',
              'id': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd'
            },
            'subscribable': true,
            'published': true,
            'id': '8f999abd-476d-4c3d-bb64-6b48c8395035'
          })
        ]/*,
        reportCardEntries: convertManyReportCardEntries([
          {
            'student': {
              'systemId': 'robert',
              'lastname': 'Avram',
              'firstname': 'Robert',
              'email': 'robert2.0@fakemail.com',
              'registrationId': '1109276011',
              'enrollment': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'id': '9efd5201-3bd8-40ee-92ea-fa360e18fbca'
            },
            'labwork': {
              'label': 'Test',
              'description': 'Test',
              'semester': '71e9d1c7-f698-4ae8-945a-c4dfdb45ab96',
              'course': '0431b5ad-3433-4430-a0ce-7d927cf5fea7',
              'degree': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'subscribable': true,
              'published': true,
              'id': '8f999abd-476d-4c3d-bb64-6b48c8395035'
            },
            'label': 'Aufgabe 1',
            'date': '2020-04-02',
            'start': '10:00:00',
            'end': '11:00:00',
            'room': {
              'label': 'R 2.109',
              'description': 'ADV-Terminalraum 2',
              'capacity': -1,
              'id': '5550ffeb-cd69-49cd-b89c-dac7974f3188'
            },
            'entryTypes': [
              {
                'entryType': 'Anwesenheitspflichtig',
                'bool': null,
                'int': 0,
                'id': '80a7edce-262e-4a2b-90d4-c3a1c6f4968a'
              },
              {
                'entryType': 'Testat',
                'bool': true,
                'int': 0,
                'id': 'c553286b-d60e-4f59-b216-0ef6dbd364b9'
              }
            ],
            'assignmentIndex': 0,
            'id': 'a42a18c4-1ccf-4a0a-828a-e5f26caf4668'
          },
          {
            'student': {
              'systemId': 'robert',
              'lastname': 'Avram',
              'firstname': 'Robert',
              'email': 'robert2.0@fakemail.com',
              'registrationId': '1109276011',
              'enrollment': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'id': '9efd5201-3bd8-40ee-92ea-fa360e18fbca'
            },
            'labwork': {
              'label': 'Test',
              'description': 'Test',
              'semester': '71e9d1c7-f698-4ae8-945a-c4dfdb45ab96',
              'course': '0431b5ad-3433-4430-a0ce-7d927cf5fea7',
              'degree': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'subscribable': true,
              'published': true,
              'id': '8f999abd-476d-4c3d-bb64-6b48c8395035'
            },
            'label': 'Aufgabe 3',
            'date': '2020-04-16',
            'start': '10:00:00',
            'end': '11:00:00',
            'room': {
              'label': 'R 2.109',
              'description': 'ADV-Terminalraum 2',
              'capacity': -1,
              'id': '5550ffeb-cd69-49cd-b89c-dac7974f3188'
            },
            'entryTypes': [
              {
                'entryType': 'Zusatzleistung',
                'bool': null,
                'int': 0,
                'id': '32bee028-6ccd-4520-8773-e1a7101b66ee'
              },
              {
                'entryType': 'Bonus',
                'bool': null,
                'int': 0,
                'id': '819ecdc3-ce59-4c56-aab8-bdc863d03127'
              },
              {
                'entryType': 'Testat',
                'bool': true,
                'int': 0,
                'id': '32de6387-7bc6-448f-9ef3-98e2b4938c95'
              },
              {
                'entryType': 'Anwesenheitspflichtig',
                'bool': null,
                'int': 0,
                'id': '69ce5de8-6c33-477f-8950-efc86f0a9c90'
              }
            ],
            'assignmentIndex': 2,
            'id': '54623c3f-0f46-49d5-8077-179005024de7'
          },
          {
            'student': {
              'systemId': 'robert',
              'lastname': 'Avram',
              'firstname': 'Robert',
              'email': 'robert2.0@fakemail.com',
              'registrationId': '1109276011',
              'enrollment': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'id': '9efd5201-3bd8-40ee-92ea-fa360e18fbca'
            },
            'labwork': {
              'label': 'Test',
              'description': 'Test',
              'semester': '71e9d1c7-f698-4ae8-945a-c4dfdb45ab96',
              'course': '0431b5ad-3433-4430-a0ce-7d927cf5fea7',
              'degree': 'c2aa93b4-9c49-4d0b-b550-a3d7a31fb3cd',
              'subscribable': true,
              'published': true,
              'id': '8f999abd-476d-4c3d-bb64-6b48c8395035'
            },
            'label': 'Aufgabe 2',
            'date': '2020-04-09',
            'start': '10:00:00',
            'end': '11:00:00',
            'room': {
              'label': 'R 2.109',
              'description': 'ADV-Terminalraum 2',
              'capacity': -1,
              'id': '5550ffeb-cd69-49cd-b89c-dac7974f3188'
            },
            'entryTypes': [
              {
                'entryType': 'Anwesenheitspflichtig',
                'bool': null,
                'int': 0,
                'id': '9a88ca0e-ead7-4125-82f5-7004801ac2ae'
              },
              {
                'entryType': 'Bonus',
                'bool': null,
                'int': 0,
                'id': 'e81b8b9e-384e-4d96-8e5d-c994cb8659fd'
              },
              {
                'entryType': 'Testat',
                'bool': null,
                'int': 0,
                'id': 'f23c6a59-0b78-4b04-bf96-8fdc09b7a13e'
              }
            ],
            'assignmentIndex': 1,
            'id': '8878f1c1-eca2-42bf-8c91-0607acdbc57a'
          }
        ])*/
      }))
    )
  }

  isApplicant = (id:string) => true


}
