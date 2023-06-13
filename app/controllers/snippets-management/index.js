import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import ConfirmDeletionModal from 'frontend-reglementaire-bijlage/components/snippets/confirm-delete-modal';

export default class SnippetsManagementIndexController extends Controller {
  @service store;
  @service router;
  @service currentSession;
  @service modals;
  @service intl;
  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippetList;

  removeSnippetList = task(async (snippetList) => {
    let confirmModal = this.modals.open(ConfirmDeletionModal, {
      title: this.intl.t('snippets.crud.confirm-deletion', {
        name: snippetList.label,
        htmlSafe: true,
      }),
      isLoading: false,
    });
    let isConfirmed = await confirmModal;
    if (isConfirmed) {
      let loadingModal = this.modals.open(ConfirmDeletionModal, {
        title: this.intl.t('snippets.crud.confirm-deletion', {
          name: snippetList.label,
          htmlSafe: true,
        }),
        isLoading: true,
      });
      const snippets = await snippetList.snippets;
      for (let snippet of snippets) {
        await snippet.destroyRecord();
      }
      await snippetList.destroyRecord();
      loadingModal.close();
    }
  });
}
