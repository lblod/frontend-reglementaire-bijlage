import Controller from '@ember/controller';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ConfirmDeletionModal from 'frontend-reglementaire-bijlage/components/codelist/confirm-delete-modal';

export default class CodelistsManagementIndexController extends Controller {
  @service router;
  @service modals;

  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';
  openModal;

  updateSearchFilterTask = restartableTask(
    async (queryParamProperty, event) => {
      await timeout(300);

      this[queryParamProperty] = event.target.value.trim();
      this.resetPagination();
    }
  );

  resetPagination() {
    this.page = 0;
  }

  removeCodelistTask = dropTask(async (codelist) => {
    this.openModal = this.modals.open(ConfirmDeletionModal, {
      codelist: codelist,
      isLoading: false,
    });
    let isConfirmed = await this.openModal;
    if (isConfirmed) {
      this.openModal = this.modals.open(ConfirmDeletionModal, {
        codelist: codelist,
        isLoading: true,
      });
      await this.destroyCodelistRecordTask.perform(codelist);
      this.openModal.close();
      this.router.refresh();
    }
  });

  destroyCodelistRecordTask = dropTask(async (codelist) => {
    let concepts = await codelist.concepts;
    await Promise.all(concepts.map((option) => option.destroyRecord()));

    await codelist.destroyRecord();
  });

  reset() {
    this.openModal?.close();
  }
}
