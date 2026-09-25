import type Template from 'frontend-reglementaire-bijlage/models/template';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

export async function setTemplateTags(template: Template, tags: TemplateTag[]) {
  template.tags = tags;
  await template.save();
}
