import type DocumentContainer from 'frontend-reglementaire-bijlage/models/document-container';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

export async function setTemplateTags(
  documentContainer: DocumentContainer,
  tags: TemplateTag[],
) {
  documentContainer.tags = tags;
  const newTags = tags.filter((tag) => tag.isNew);
  await Promise.all(newTags.map((nt) => nt.save()));
  await documentContainer.save();
}
