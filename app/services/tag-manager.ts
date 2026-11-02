import { service } from '@ember/service';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { NewTag } from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import type DocumentContainer from 'frontend-reglementaire-bijlage/models/document-container';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { trackedFunction } from 'reactiveweb/function';

export default class TagManager extends Service {
  @service declare store: Store;

  @tracked private previousTags: Tag[] = [];

  createTag = (newTag: NewTag) => {
    return this.store.createRecord<Tag>('tag', {
      value: newTag.searchTerm,
      createdOn: new Date(),
    });
  };

  private tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    const tags = (
      await this.store.countAndFetchAll('tag', { sort: ':no-case:value' })
    ).content as Tag[];
    return tags.slice();
  });

  /**
   * Stable tag list for rendering. While the tracked function reloads, its
   * value is null, so fall back to the last successfully loaded tags instead
   * of unmounting the tag selectors and causing layout jumps.
   */
  get tagOptions(): Tag[] {
    return this.tags.value ?? this.previousTags;
  }

  async saveTags(tags: Tag[] = []) {
    const newTags = tags.filter((tag) => tag.isNew);

    if (newTags.length === 0) return;

    await Promise.all(newTags.map((tag) => tag.save()));

    // Ember Data queries are not tracked, so explicitly reload the tag list.
    await this.refreshTags();
  }

  async refreshTags() {
    this.previousTags = this.tags.value ?? this.previousTags;
    await this.tags.retry();
  }

  async setTags(taggedThing: DocumentContainer | SnippetList, tags: Tag[]) {
    await this.saveTags(tags);
    taggedThing.tags = tags;
    await taggedThing.save();
  }
}
