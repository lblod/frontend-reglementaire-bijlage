import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class ListController extends Controller {
  @service store;
  @task
  *createReglement() {
    const reglement = this.store.createRecord('reglement');
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
    console.log(reglement);
  }
}
