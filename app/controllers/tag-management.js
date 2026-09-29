import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';

export default class TagManagementController extends Controller {
  @service router;

  queryParams = ['page', 'size', 'label', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  @localCopy('label', '') searchQuery;

  @tracked isRemoveModalOpen = false;
  @tracked modalTag;

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

  @action openRemoveModal(tag) {
    this.modalTag = tag;
    this.isRemoveModalOpen = true;
  }

  @action closeRemoveModal() {
    this.modalTag = null;
    this.isRemoveModalOpen = false;
  }

  removeTag = task(async () => {
    await this.modalTag.destroyRecord();
    this.reset();
    this.router.refresh();
  });

  reset() {
    this.closeRemoveModal();
  }
}
