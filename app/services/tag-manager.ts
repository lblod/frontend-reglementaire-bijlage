import type ToasterService from '@appuniversum/ember-appuniversum/services/toaster';
import { service } from '@ember/service';
import Service from '@ember/service';
import type { NewTag } from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import type IntlService from 'ember-intl/services/intl';
import type DocumentContainer from 'frontend-reglementaire-bijlage/models/document-container';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { sortTags } from 'frontend-reglementaire-bijlage/utils/sort-tags';

export default class TagManager extends Service {
  @service declare store: Store;
  @service declare toaster: ToasterService;
  @service declare intl: IntlService;

  async loadTags() {
    try {
      await this.store.countAndFetchAll('tag', { sort: ':no-case:value' });
    } catch (error) {
      console.error('Failed to load tags', error);
      this.toaster.error(
        this.intl.t('tag-management.error-loading-tags.body'),
        this.intl.t('tag-management.error-loading-tags.title'),
      );
    }
  }

  createTag = (newTag: NewTag) => {
    return this.store.createRecord<Tag>('tag', {
      value: newTag.searchTerm,
      createdOn: new Date(),
    });
  };

  /**
   * Retrieve directly from the ember-data store.
   * Tags have already been fetched.
   */
  get tags(): Tag[] {
    const allTags = this.store.peekAll('tag') as Tag[];
    return sortTags(allTags);
  }

  async saveTags(tags: Tag[] = []) {
    const newTags = tags.filter((tag) => tag.isNew);

    if (newTags.length === 0) return;

    await Promise.all(newTags.map((tag) => tag.save()));
  }

  async setTags(taggedThing: DocumentContainer | SnippetList, tags: Tag[]) {
    await this.saveTags(tags);
    taggedThing.set('tags', tags);
    await taggedThing.save();
  }
}
