import Controller from '@ember/controller';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { RS_STANDARD_FOLDER } from '../../utils/constants';

export default class ListController extends Controller {
  @service store;
  @service session;
  @service router;
  @service currentSession;
  @service muTask;

  @tracked page = 0;
  @tracked size = 20;
  @tracked title = '';
  @tracked debounceTime = 2000;
  @tracked editorDocument;
  @tracked documentContainer;
  @tracked createReglementModalIsOpen;
  @tracked removeReglementModalIsOpen;
  sort = '-current-version.created-on';

  @action
  startCreateReglementFlow() {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = '';
    this.editorDocument = editorDocument;
    this.documentContainer = documentContainer;

    documentContainer.currentVersion = editorDocument;

    this.createReglementModalIsOpen = true;
  }

  @action
  cancelCreateReglement() {
    this.editorDocument = undefined;
    this.documentContainer = undefined;
    this.createReglementModalIsOpen = false;
  }

  saveReglement = task(async (event) => {
    event.preventDefault();
    await this.editorDocument.save();
    const folder = await this.store.findRecord(
      'editor-document-folder',
      RS_STANDARD_FOLDER
    );
    this.documentContainer.folder = folder;
    await this.documentContainer.save();
    this.createReglementModalIsOpen = false;
    this.router.transitionTo(
      'regulatory-attachments.edit',
      this.documentContainer.id
    );
  });

  @action
  startRemoveReglementFlow(documentContainer) {
    this.removeReglementModalIsOpen = true;
    this.documentContainer = documentContainer;
  }

  @action
  cancelRemoveReglement() {
    this.editorDocument = undefined;
    this.removeReglementModalIsOpen = false;
  }

  submitRemoveReglement = task(async () => {
    // this is currenlty a hard-delete of the container, but a soft-delete of the
    // publishedVersion, since GN filters on the validThrough date
    // if we'd want to soft-delete the container as well
    // we'd likely have to use RS_DELETED_FOLDER from utils/constants

    const editorDocument = await this.documentContainer.currentVersion;
    const publishedVersion = await editorDocument.publishedVersion;
    if (publishedVersion) {
      publishedVersion.validThrough = new Date();
      await publishedVersion.save();
    }
    this.removeReglementModalIsOpen = false;
    await editorDocument.deleteRecord();
    await editorDocument.save();
    await this.documentContainer.deleteRecord();
    await this.documentContainer.save();
    this.refresh();
  });

  @action
  logout() {
    this.session.invalidate();
  }

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
}
