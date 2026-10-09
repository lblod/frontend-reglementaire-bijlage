import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { localCopy } from 'tracked-toolbox';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type Router from 'frontend-reglementaire-bijlage/router';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';

export default class SnippetManagementIndexController extends Controller {
  @service declare store: Store;
  @service declare router: Router;
  @service declare currentSession: CurrentSessionService;

  queryParams = ['page', 'size', 'label', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery = '';

  @tracked selectedSnippetLists = tracked(Set);
  @tracked lastCheckedSnippetList: string | null = null;

  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippetList: SnippetList | null = null;

  @action
  updateSearchQuery(event: Event) {
    event.preventDefault();
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  @action
  search(event: Event) {
    event.preventDefault();
    this.label = this.searchQuery;
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }

  removeSnippetList = task(async () => {
    if (!this.deletingSnippetList) return;
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
  openRemoveModal(snippet: SnippetList) {
    this.deletingSnippetList = snippet;
    this.isRemoveModalOpen = true;
  }

  @action
  closeRemoveModal() {
    this.deletingSnippetList = null;
    this.isRemoveModalOpen = false;
  }

  isSelected = (uri: string) => {
    return this.selectedSnippetLists.has(uri);
  };

  @action
  onSnippetListSelectionChange(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value;
    if (element.checked) {
      if ((event as KeyboardEvent).shiftKey && this.lastCheckedSnippetList) {
        const snippetLists: SnippetList[] = [...this.model];
        const index1 = snippetLists.findIndex(
          (list) => list.uri === this.lastCheckedSnippetList,
        );
        const index2 = snippetLists.findIndex((list) => {
          return list.uri === value;
        });
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);
        for (let i = startIndex; i <= endIndex; i++) {
          const snippetList = snippetLists[i] as SnippetList;
          this.selectedSnippetLists.add(snippetList.uri);
        }
      } else {
        this.selectedSnippetLists.add(value);
      }
      this.lastCheckedSnippetList = value;
    } else {
      this.selectedSnippetLists.delete(value);
    }
  }

  get selectAllChecked() {
    return this.selectedSnippetLists.size > 0;
  }

  @action
  onSelectAllChange(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      const snippetLists = [...this.model];
      this.selectedSnippetLists = tracked(
        new Set(snippetLists.map((list) => list.uri)),
      );
    } else {
      this.selectedSnippetLists = tracked(new Set());
    }
  }
}
