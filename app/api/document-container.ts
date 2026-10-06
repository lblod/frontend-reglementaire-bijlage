import type DocumentContainer from 'frontend-reglementaire-bijlage/models/document-container';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

export async function setTemplateTags(
  documentContainer: DocumentContainer,
  tags: Tag[],
) {
  const newTags = tags.filter((tag) => tag.isNew);
  await Promise.all(newTags.map((nt) => nt.save()));
  documentContainer.tags = tags;
  await documentContainer.save();
}
