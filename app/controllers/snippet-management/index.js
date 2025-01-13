import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
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

  @tracked selectedSnippetLists = tracked(Set);
  @tracked lastCheckedSnippetList;

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

  isSelected = (uri) => {
    return this.selectedSnippetLists.has(uri);
  };

  @action
  onSnippetListSelectionChange(event) {
    const value = event.target.value;
    if (event.target.checked) {
      if (event.shiftKey && this.lastCheckedSnippetList) {
        const snippetLists = [...this.model];
        const index1 = snippetLists.findIndex(
          (list) => list.uri === this.lastCheckedSnippetList,
        );
        const index2 = snippetLists.findIndex((list) => {
          return list.uri === value;
        });
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);
        for (let i = startIndex; i <= endIndex; i++) {
          const snippetList = snippetLists[i];
          this.selectedSnippetLists.add(snippetList.uri);
        }
      } else {
        this.selectedSnippetLists.add(value);
      }
      this.lastCheckedSnippetList = value;
    } else {
      this.selectedSnippetLists.delete(value);
    }
    console.log(this.selectedSnippetLists);
  }

  get selectAllChecked() {
    return this.selectedSnippetLists.size > 0;
  }

  @action
  onSelectAllChange() {
    if (event.target.checked) {
      const snippetLists = [...this.model];
      this.selectedSnippetLists = tracked(
        new Set(snippetLists.map((list) => list.uri)),
      );
    } else {
      this.selectedSnippetLists = tracked(new Set());
    }
  }
}
