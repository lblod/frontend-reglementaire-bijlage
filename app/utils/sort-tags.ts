import compare from '@ember/utils/lib/compare';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

export function sortTags(tags: Tag[]) {
  return tags.toSorted((tag1, tag2) => compare(tag1.value, tag2.value));
}
