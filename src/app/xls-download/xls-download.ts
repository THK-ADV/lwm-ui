import { LabworkAtom } from "../models/labwork.model"

export const initiateDownload = (fileName: string, blob: Blob) => {
  const downloadURL = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = downloadURL
  link.download = fileName
  link.click()
}

export const initiateDownloadWithDefaultFilenameSuffix = (
  filenamePrefix: string,
  labwork: LabworkAtom,
  blob: Blob,
) =>
  initiateDownload(
    `${filenamePrefix}_${labwork.label}_${labwork.semester.abbreviation}.xls`,
    blob,
  )
