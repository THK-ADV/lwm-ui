export const initiateDownload = (fileName: string, blob: Blob) => {
    const downloadURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadURL
    link.download = fileName
    link.click()
}
