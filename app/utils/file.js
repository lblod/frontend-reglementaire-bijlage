/**
 * @param {import('../models/file').default} file
 *
 */
export async function download(file) {
  const response = await fetch(file.downloadLink);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const blob = await response.blob();

  const linkElement = document.createElement('a');
  const href = URL.createObjectURL(blob);
  linkElement.href = href;
  linkElement.download = file.name;
  linkElement.click();
  URL.revokeObjectURL(href);
}
