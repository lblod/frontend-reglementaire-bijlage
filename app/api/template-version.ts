import { isAfter } from 'date-fns';
import type TemplateVersion from 'frontend-reglementaire-bijlage/models/template-version';

export interface TemplateValidity {
  created: Date;
  validThrough?: Date;
}
export function getValidityOfTemplateVersion(
  templateVersion: TemplateVersion,
): TemplateValidity {
  let validThrough =
    templateVersion.validThrough && new Date(templateVersion.validThrough);
  if (validThrough && isAfter(validThrough, Date.now())) {
    // Only display as unpublished when it actually is
    validThrough = undefined;
  }
  return { created: templateVersion.created, validThrough };
}
