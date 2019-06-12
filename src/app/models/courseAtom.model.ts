import { Lecturer } from './user.model';

export class CourseAtom {

    constructor(public label: string, public description: string, public abbreviation: string, public lecturer: Lecturer, public semesterIndex: number, public id: string) { }

}