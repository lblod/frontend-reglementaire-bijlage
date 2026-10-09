import type DocumentContainer from 'frontend-reglementaire-bijlage/models/document-container';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

export async function setTags(
  taggedThing: DocumentContainer | SnippetList,
  tags: Tag[],
) {
  const newTags = tags.filter((tag) => tag.isNew);
  await Promise.all(newTags.map((nt) => nt.save()));
  taggedThing.tags = tags;
  await taggedThing.save();
}
