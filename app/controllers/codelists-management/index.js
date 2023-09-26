import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CodelistsManagementIndexController extends Controller {
  @service router;

  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';
  @tracked isRemoveModalOpen = false;
  @tracked modalCodelist;

  updateSearchFilterTask = restartableTask(
    async (queryParamProperty, event) => {
      await timeout(300);

      this[queryParamProperty] = event.target.value.trim();
      this.resetPagination();
    },
  );

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
    await Promise.all(
      this.modalCodelist.concepts.map((option) => option.destroyRecord()),
    );

    await this.modalCodelist.destroyRecord();
    this.reset();
    this.router.refresh();
  });

  reset() {
    this.closeRemoveModal();
  }
}
