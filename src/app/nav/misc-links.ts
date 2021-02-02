export interface MiscLink {
    label: string
    path: string
}

export const standardMiscLinks = (): MiscLink[] => [
    {label: 'Datenschutzerklärung', path: 'privacy'},
    {label: 'Release notes', path: 'release-notes'},
]
