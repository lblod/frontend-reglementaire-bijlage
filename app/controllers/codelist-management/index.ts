import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';
import type CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';
import { type TrackedSet, tracked } from 'tracked-built-ins';
import type CodelistManagementIndexRoute from 'frontend-reglementaire-bijlage/routes/codelist-management/index';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';

const LABEL_SEARCH_DEBOUNCE_TIME = 300;

export default class CodelistManagementIndexController extends Controller {
  declare model: ModelFrom<CodelistManagementIndexRoute>;
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare tagManager: TagManager;

  queryParams = ['page', 'size', 'label', 'sort', 'tags'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery = '';

  @tracked isRemoveModalOpen = false;
  @tracked modalCodelist: CodeListModel | null = null;

  @tracked selectedCodelists: TrackedSet<string> = tracked(Set);
  @tracked lastSelectedCodelist: string | null = null;

  @tracked tags: (string | null)[] = [];
  @tracked isReadMode = true;
  @tracked bulkEditModalIsOpen = false;

  updateSearchQuery = (event: Event) => {
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

  openRemoveModal = (codelist: CodeListModel) => {
    this.modalCodelist = codelist;
    this.isRemoveModalOpen = true;
  }

  closeRemoveModal = () => {
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
    await this.tagManager.setTags(codeList, tags);
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

  get selectAllChecked() {
    return this.selectedCodelists.size > 0;
  }
  
  changeCodelistSelection = (event: Event) => {
    const element = event.target as HTMLInputElement;
    const value = element.value;
    if (element.checked) {
      if ((event as KeyboardEvent).shiftKey && this.lastSelectedCodelist) {
        const snippetLists = [...this.model.codelists];
        const index1 = snippetLists.findIndex(
          (list) => list.uri === this.lastSelectedCodelist,
        );
        const index2 = snippetLists.findIndex((list) => {
          return list.uri === value;
        });
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);
        for (let i = startIndex; i <= endIndex; i++) {
          const snippetList = snippetLists[i] as CodeListModel;
          if (!snippetList.uri) continue;
          this.selectedCodelists.add(snippetList.uri);
        }
      } else {
        this.selectedCodelists.add(value);
      }
      this.lastSelectedCodelist = value;
    } else {
      this.selectedCodelists.delete(value);
    }
  };

  isSelected = (uri: string) => {
    return this.selectedCodelists.has(uri);
  };

  toggleSelectAll = (event: Event) => {
    if ((event.target as HTMLInputElement).checked) {
      const codelists = [...this.model.codelists];
      const codelistUris = codelists.flatMap(
        (codelist) => codelist.uri ?? [],
      );
      this.selectedCodelists = tracked(new Set(codelistUris));
    } else {
      this.selectedCodelists = tracked(new Set<string>());
    }
  };
}
