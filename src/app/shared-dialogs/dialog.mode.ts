export enum DialogMode {
  edit,
  create,
}

export const dialogTitle = (mode: DialogMode, modelName: string): string => {
  switch (mode) {
    case DialogMode.create:
      return `${modelName} erstellen`
    case DialogMode.edit:
      return `${modelName} bearbeiten`
  }
}

export const dialogSubmitTitle = (mode: DialogMode): string => {
  switch (mode) {
    case DialogMode.create:
      return 'Erstellen'
    case DialogMode.edit:
      return 'Aktualisieren'
  }
}
