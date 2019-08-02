export enum UserStatus {
    admin = 'Administrator',
    student = 'Student',
    employee = 'Mitarbeiter'
}

export function AllUserStatus(): UserStatus[] {
    return [UserStatus.admin, UserStatus.employee, UserStatus.student]
}
