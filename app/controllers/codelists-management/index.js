import Controller from '@ember/controller';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
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

  @action async removeCodelist(codelist) {
    let confirmModal = this.modals.open(ConfirmDeletionModal, {
      codelist: codelist,
      isLoading: false,
    });
    let isConfirmed = await confirmModal;
    if (isConfirmed) {
      let loadingModal = this.modals.open(ConfirmDeletionModal, {
        codelist: codelist,
        isLoading: true,
      });
      await this.removeCodelistTask.perform(codelist);
      loadingModal.close();
    }
  }

  removeCodelistTask = dropTask(async (codelist) => {
    await Promise.all(
      codelist.concepts.map((option) => option.destroyRecord())
    );

    await codelist.destroyRecord();
    this.router.refresh();
  });
}
