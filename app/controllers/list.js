import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @service store;
  @service session;
  @service router;
  @service currentSession;

  @tracked editorDocument;
  @tracked documentContainer;
  @tracked reglement;
  @tracked createReglementModalIsOpen;

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
    console.log('saved');
    this.router.transitionTo('edit', this.reglement.id);
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
