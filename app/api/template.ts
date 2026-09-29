import type Template from 'frontend-reglementaire-bijlage/models/template';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

export async function setTemplateTags(template: Template, tags: TemplateTag[]) {
  template.tags = tags;
  const newTags = tags.filter((tag) => tag.isNew);
  await Promise.all(newTags.map((nt) => nt.save()));
  await template.save();
}
