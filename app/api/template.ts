import isAfter from 'date-fns/isAfter';
import type Template from 'frontend-reglementaire-bijlage/models/template';

export async function getValidity(template: Template) {
  const templateVersion = await template.currentVersion;
  if (!templateVersion) {
    return;
  }
  let validThrough =
    templateVersion.validThrough && new Date(templateVersion.validThrough);
  if (validThrough && isAfter(validThrough, Date.now())) {
    // Only display as unpublished when it actually is
    validThrough = undefined;
  }
  return { created: templateVersion.created, validThrough };
}
