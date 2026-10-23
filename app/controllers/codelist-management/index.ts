import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';
import type CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';
import type RouterService from '@ember/routing/router-service';

export default class CodelistManagementIndexController extends Controller {
  @service declare router: RouterService;

  queryParams = ['page', 'size', 'label', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery = '';

  @tracked isRemoveModalOpen = false;
  @tracked modalCodelist: CodeListModel | null = null;

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

  reset() {
    this.closeRemoveModal();
  }
}
