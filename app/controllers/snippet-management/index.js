import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { localCopy } from 'tracked-toolbox';

export default class SnippetManagementIndexController extends Controller {
  @service store;
  @service router;
  @service currentSession;

  queryParams = ['page', 'size', 'label', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery;

  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippetList;

  @action
  updateSearchQuery(event) {
    event.preventDefault();
    this.searchQuery = event.target.value;
  }

  @action
  search(event) {
    event.preventDefault();
    this.label = this.searchQuery;
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }

  removeSnippetList = task(async () => {
    const snippets = await this.deletingSnippetList.snippets;

    await Promise.all(
      snippets.map(async (snippet) => {
        const currentVersion = await snippet.currentVersion;

        if (currentVersion) {
          currentVersion.validThrough = new Date();
          await currentVersion.save();
        }
      }),
    );

    await this.deletingSnippetList.destroyRecord();
    this.closeRemoveModal();
  });

  @action
  openRemoveModal(snippet) {
    this.deletingSnippetList = snippet;
    this.isRemoveModalOpen = true;
  }

  @action
  closeRemoveModal() {
    this.deletingSnippetList = null;
    this.isRemoveModalOpen = false;
  }
}
