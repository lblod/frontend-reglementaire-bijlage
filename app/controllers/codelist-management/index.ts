import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';
import type CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { setTags } from 'frontend-reglementaire-bijlage/api/document-container';

const LABEL_SEARCH_DEBOUNCE_TIME = 300;

export default class CodelistManagementIndexController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

  queryParams = ['page', 'size', 'label', 'sort', 'tags'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery = '';

  @tracked isRemoveModalOpen = false;
  @tracked modalCodelist: CodeListModel | null = null;

  @tracked tags: (string | null)[] = [];
  @tracked isReadMode = true;

  @action
  updateSearchQuery(event: Event) {
    event.preventDefault();
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  changeFilterLabel = restartableTask(async (label: string) => {
    await timeout(LABEL_SEARCH_DEBOUNCE_TIME);
    this.label = label;
    this.resetPagination();
  });

  changeFilterTags = (tags: Tag[]) => {
    this.tags = tags.map((tag) => tag.id);
    this.resetPagination();
  };

  resetFilters = () => {
    this.tags = [];
    this.label = '';
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }

  @action openRemoveModal(codelist: CodeListModel) {
    this.modalCodelist = codelist;
    this.isRemoveModalOpen = true;
  }

  @action closeRemoveModal() {
    this.modalCodelist = null;
    this.isRemoveModalOpen = false;
  }

  removeCodelist = task(async () => {
    const concepts = await this.modalCodelist?.concepts;
    if (!concepts) return;
    await Promise.all(concepts.map((option) => option.destroyRecord()));

    await this.modalCodelist?.destroyRecord();
    this.reset();
    this.router.refresh();
  });

  changeTagsFor = async (codeList: CodeListModel, tags: Tag[]) => {
    await setTags(codeList, tags);
  };

  get tagList() {
    // we get a reactive, sync array of which template tags are in the store
    // this means any new tags we make are immediately available and rerender the ui
    // without making extra requests.
    // On initial load this is filled with all tags from the backend, because the route
    // fetches them
    return this.store.peekAll('tag');
  }

  reset() {
    this.closeRemoveModal();
    this.resetPagination();
    this.resetFilters();
    this.isReadMode = true;
  }
}
