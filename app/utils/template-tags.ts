import compare from '@ember/utils/lib/compare';

export function sortTags(tags: { label: string }[]) {
  return tags.toSorted((option1, option2) =>
    compare(option1.label, option2.label),
  );
}
