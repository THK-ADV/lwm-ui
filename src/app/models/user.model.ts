import { Degree } from './degree.model';

export interface User {
  systemId: string;
  lastname: string;
  firstname: string; 
  email: string; 
  id: string;
}

export interface Employee extends User {}

export interface Lecturer extends User {}

export interface StudentAtom extends User {
  registrationId: String;
  enrollment: Degree;
}

export interface Student extends User {
  registrationId: String;
  enrollment: String;
}