export interface Internal {
  kind: "internal"
  path: string
}

export interface External {
  kind: "external"
  path: string
}

export type URL = Internal | External

export interface MiscLink {
  label: string
  url: URL
}

export const standardMiscLinks = (): MiscLink[] => [
  { label: "Datenschutzerklärung", url: { kind: "internal", path: "privacy" } },
  { label: "Release notes", url: { kind: "internal", path: "release-notes" } },
  {
    label: "Issue Tracker",
    url: { kind: "external", path: "https://github.com/THK-ADV/lwm-ui/issues" },
  },
]
