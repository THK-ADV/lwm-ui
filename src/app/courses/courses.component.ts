// import {Component, OnInit} from '@angular/core'
// import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
// import {CourseProtocol, CourseService} from '../services/course.service'
// import {CourseAtom} from '../models/course.model'
// import {MatDialog} from '@angular/material'
// import {AlertService} from '../services/alert.service'
// import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
// import {UserService} from '../services/user.service'
// import {createProtocol} from '../models/protocol.model'
// import {courseFormInputData, emptyCourseProtocol, updateCourse} from '../utils/component.utils'
//
// @Component({
//     selector: 'app-courses',
//     templateUrl: '../abstract-crud/old-abstract-crud.component.html',
//     styleUrls: ['../abstract-crud/old-abstract-crud.component.scss']
// })
// export class CoursesComponent extends AbstractCRUDComponent<CourseProtocol, CourseAtom> implements OnInit {
//
//     static columns = (): TableHeaderColumn[] => {
//         return [
//             {attr: 'label', title: 'Bezeichnung'},
//             {attr: 'description', title: 'Beschreibung'},
//             {attr: 'abbreviation', title: 'Abkürzung'},
//             {attr: 'lecturer', title: 'Dozent'},
//             {attr: 'semesterIndex', title: 'Fachsemester'}
//         ]
//     }
//
//     static prepareTableContent = (course: Readonly<CourseAtom>, attr: string): string => {
//         if (attr === 'lecturer') {
//             return `${course.lecturer.lastname}, ${course.lecturer.firstname}`
//         } else {
//             return course[attr]
//         }
//     }
//
//     constructor(
//         private readonly courseService: CourseService,
//         readonly dialog: MatDialog,
//         readonly alertService: AlertService,
//         private userService: UserService
//     ) {
//         super(
//             () => courseService,
//             dialog,
//             alertService,
//             CoursesComponent.columns(),
//             ['create', 'update'],
//             'label',
//             'Modul',
//             'Module',
//             courseFormInputData(userService),
//             _ => '',
//             CoursesComponent.prepareTableContent,
//             emptyCourseProtocol,
//             () => undefined
//         )
//     }
//
//     ngOnInit() {
//         super.ngOnInit()
//         this.fetchData()
//     }
//
//     create(output: FormOutputData[]): CourseProtocol {
//         return createProtocol(output, emptyCourseProtocol())
//     }
//
//     update(model: CourseAtom, updatedOutput: FormOutputData[]): CourseProtocol {
//         return updateCourse(model, updatedOutput)
//     }
// }
