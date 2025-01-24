import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';

export default class CodelistManagementIndexController extends Controller {
  @service router;

  queryParams = ['page', 'size', 'label', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery;

  @tracked isRemoveModalOpen = false;
  @tracked modalCodelist;

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

  @action openRemoveModal(codelist) {
    this.modalCodelist = codelist;
    this.isRemoveModalOpen = true;
  }

  @action closeRemoveModal() {
    this.modalCodelist = null;
    this.isRemoveModalOpen = false;
  }

  removeCodelist = task(async () => {
    const concepts = await this.modalCodelist.concepts;
    await Promise.all(concepts.map((option) => option.destroyRecord()));

    await this.modalCodelist.destroyRecord();
    this.reset();
    this.router.refresh();
  });

  reset() {
    this.closeRemoveModal();
  }
}
