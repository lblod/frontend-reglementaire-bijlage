import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ListController extends Controller {
  @service store;
  @service session;
  @service currentSession;
  @task
  *createReglement() {
    const reglement = this.store.createRecord('regulatory-statement');
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = 'title';
    editorDocument.previousVersion = this.editorDocument;
    yield editorDocument.save();

    documentContainer.currentVersion = editorDocument;
    yield documentContainer.save();
    reglement.document = documentContainer;
    yield reglement.save();
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
