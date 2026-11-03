import { service } from "@ember/service";
import Service from "@ember/service";
import type { NewTag } from "@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector";
import type Tag from "frontend-reglementaire-bijlage/models/tag";
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { trackedFunction } from "reactiveweb/function";

export default class TagManager extends Service {
  @service declare store: Store;

  createTag = (newTag: NewTag) => {
    return this.store.createRecord<Tag>('tag', {
      value: newTag.searchTerm,
      createdOn: new Date(),
    });
  };

  tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    const tags = (
      await this.store.countAndFetchAll('tag', { sort: ':no-case:value' })
    ).content as Tag[];
    return tags.slice();
  });
}