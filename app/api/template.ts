import type Template from 'frontend-reglementaire-bijlage/models/template';
import {
  getValidityOfTemplateVersion,
  type TemplateValidity,
} from './template-version';
export async function getValidity(
  template: Template,
): Promise<TemplateValidity | undefined> {
  const templateVersion = await template.currentVersion;
  if (!templateVersion) {
    return;
  }
  return getValidityOfTemplateVersion(templateVersion);
}
