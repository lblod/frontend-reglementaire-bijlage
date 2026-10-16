import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';
import type RouterService from '@ember/routing/router-service';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

export default class TagManagementController extends Controller {
  @service declare router: RouterService;

  queryParams = ['page', 'size', 'value', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked value = '';
  @tracked sort = '-created-on';

  @localCopy('value', '') declare searchQuery: string;

  @tracked isRemoveModalOpen = false;
  @tracked modalTag: Tag | null = null;

  @action
  updateSearchQuery(event: Event) {
    event.preventDefault();
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  @action
  search(event: Event) {
    event.preventDefault();
    this.value = this.searchQuery;
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }

  @action openRemoveModal(tag: Tag) {
    this.modalTag = tag;
    this.isRemoveModalOpen = true;
  }

  @action closeRemoveModal() {
    this.modalTag = null;
    this.isRemoveModalOpen = false;
  }

  removeTag = task(async () => {
    await this.modalTag?.destroyRecord();
    this.reset();
    this.router.refresh();
  });

  reset() {
    this.closeRemoveModal();
  }
}
