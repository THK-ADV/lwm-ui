export class Config {

    constructor(public readonly label: string, public readonly path: string) {
    }

    static All(): Config[] {
        return [
            new Config('Berechtigungen', 'e/authorities'),
            new Config('Module', 'e/modules'),
            new Config('Räume', 'e/rooms'),
            new Config('Studiengänge', 'e/degrees'),
            new Config('Semester', 'e/semesters')
        ]
    }
}
