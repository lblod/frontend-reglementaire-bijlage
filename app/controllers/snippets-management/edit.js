import Controller from '@ember/controller';
import { service } from '@ember/service';
import { restartableTask, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';

export default class SnippetsManagementEditController extends Controller {
  @service store;
  @service router;
  @service currentSession;
  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';
  @tracked showSaved = false;

  @restartableTask
  *updateLabel(event) {
    const value = event.target.value;
    yield timeout(1000);
    this.model.label = value;
    yield this.model.save();
    this.showSaved = true;
    setTimeout(() => (this.showSaved = false), 3000);
  }

  @task
  *createSnippet() {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = `Snippet created on ${new Date().toDateString()}`;
    documentContainer.currentVersion = editorDocument;
    yield this.model.snippets;
    this.model.snippets.pushObject(documentContainer);
    yield editorDocument.save();
    yield documentContainer.save();
    yield this.model.save();

    this.router.transitionTo(
      'snippets-management.edit-snippet',
      documentContainer
    );
  }

  @task
  *removeSnippet(snippet) {
    this.model.snippets.removeObject(snippet);
    yield this.model.save();
  }
}