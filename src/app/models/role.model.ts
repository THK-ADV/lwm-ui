export interface Role {
    label: string
    id: string
}

export enum UserRole {
    admin = 'Administrator',
    student = 'Student',
    employee = 'Mitarbeiter',
    courseManager = 'Modulverantwortlicher',
    courseEmployee = 'Modulmitarbeiter',
    courseAssistant = 'Hilfskraft'
}
