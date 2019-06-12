export class Config {

    constructor(public label: string, public path: string) {
    }

    static All(): Config[] {
        return [
            new Config('Berechtigungen', 'authorities'),
            new Config('Module', 'courses'),
            new Config('Räume', 'rooms'),
            new Config('Studiengänge', 'degrees'),
            new Config('Semester', 'semesters'),
            new Config('Mitarbeiter-Dashboard', 'e')
        ]
    }
}
