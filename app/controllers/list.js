import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { RS_DELETED_FOLDER, RS_STANDARD_FOLDER } from '../utils/constants';

export default class ListController extends Controller.extend(
  DefaultQueryParamsMixin
) {
  @service store;
  @service session;
  @service router;
  @service currentSession;
  @service muTask;

  @tracked page = 0;
  @tracked size = 20;
  @tracked debounceTime = 2000;
  @tracked editorDocument;
  @tracked documentContainer;
  @tracked reglement;
  @tracked createReglementModalIsOpen;
  @tracked removeReglementModalIsOpen;
  sort = '-document.current-version.created-on';

  @action
  startCreateReglementFlow() {
    const reglement = this.store.createRecord('regulatory-statement');
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = '';
    this.editorDocument = editorDocument;
    this.documentContainer = documentContainer;
    this.reglement = reglement;

    documentContainer.currentVersion = editorDocument;

    reglement.document = documentContainer;
    reglement.folder = RS_STANDARD_FOLDER;

    this.createReglementModalIsOpen = true;
  }

  @action
  cancelCreateReglement() {
    this.editorDocument = undefined;
    this.documentContainer = undefined;
    this.reglement = undefined;
    this.createReglementModalIsOpen = false;
  }

  @task
  *saveReglement(event) {
    event.preventDefault();
    yield this.editorDocument.save();
    yield this.documentContainer.save();
    yield this.reglement.save();
    this.createReglementModalIsOpen = false;
    this.router.transitionTo('edit', this.reglement.id);
  }

  @action
  startRemoveReglementFlow(reglement) {
    this.removeReglementModalIsOpen = true;
    this.reglement = reglement;
  }

  @action
  cancelRemoveReglement() {
    this.reglement = undefined;
    this.removeReglementModalIsOpen = false;
  }

  @task
  *submitRemoveReglement() {
    this.reglement.folder = RS_DELETED_FOLDER;
    const publishedVersion = yield this.reglement.publishedVersion;
    if (publishedVersion) {
      publishedVersion.validThrough = new Date();
      yield publishedVersion.save();
    }
    yield this.reglement.save();
    this.removeReglementModalIsOpen = false;
    this.refresh();
  }

  @task
  *deleteReglement(id) {
    const reglement = yield this.store.findRecord('regulatory-statement', id);
    const documentContainer = yield reglement.document;
    const editorDocument = yield documentContainer.currentVersion;
    yield editorDocument.deleteRecord();
    yield editorDocument.save();
    yield documentContainer.deleteRecord();
    yield documentContainer.save();
    yield reglement.deleteRecord();
    yield reglement.save();
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
