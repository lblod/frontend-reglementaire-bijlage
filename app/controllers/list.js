import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { RS_DELETED_FOLDER, RS_STANDARD_FOLDER } from '../utils/constants';

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

  @task
  *saveReglement(event) {
    event.preventDefault();
    yield this.editorDocument.save();
    const folder = yield this.store.findRecord(
      'editor-document-folder',
      RS_STANDARD_FOLDER
    );
    this.documentContainer.folder = folder;
    yield this.documentContainer.save();
    this.createReglementModalIsOpen = false;
    this.router.transitionTo('edit', this.documentContainer.id);
  }

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

  @task
  *submitRemoveReglement() {
    this.documentContainer.folder = RS_DELETED_FOLDER;
    const editorDocument = yield this.documentContainer.currentVersion;
    const publishedVersion = yield editorDocument.publishedVersion;
    if (publishedVersion) {
      publishedVersion.validThrough = new Date();
      yield publishedVersion.save();
    }
    this.removeReglementModalIsOpen = false;
    yield editorDocument.deleteRecord();
    yield editorDocument.save();
    yield this.documentContainer.deleteRecord();
    yield this.documentContainer.save();
    this.refresh();
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @restartableTask
  *updateSearchFilterTask(queryParamProperty, event) {
    yield timeout(300);

    this[queryParamProperty] = event.target.value.trim();
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }
}
