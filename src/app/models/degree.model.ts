export class Degree {

  static urlResource = 'degrees';
  static contentType = 'application/vnd.fhk.degree.V1+json';

  constructor(public label: string, public abbreviation: string, public id?: string) { }

}
