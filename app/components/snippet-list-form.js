import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '../utils/strings';

export default class SnippetListForm extends Component {
  @service store;
  @service router;
  @service currentSession;

  @tracked label = '';
  @tracked showSaved = false;
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippet;

  updateLabel = restartableTask(async (event) => {
    const value = event.target.value;
    this.args.model.label = value;
    if (this.invalidLabel) {
      return;
    }
    const isNew = this.args.model.isNew;
    await timeout(1000);
    await this.args.model.save();
    this.showSavedTask.perform();
    if (isNew) {
      this.router.transitionTo('snippets-management.edit', this.args.model);
    }
  });

  get invalidLabel() {
    return isBlank(this.args.model.label);
  }

  showSavedTask = restartableTask(async () => {
    this.showSaved = true;
    await timeout(3000);
    this.showSaved = false;
  });

  createSnippet = task(async () => {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = `Snippet created on ${new Date().toDateString()}`;
    documentContainer.currentVersion = editorDocument;
    await this.args.model.snippets;
    this.args.model.snippets.pushObject(documentContainer);
    await editorDocument.save();
    await documentContainer.save();
    await this.args.model.save();

    this.router.transitionTo(
      'snippets-management.edit.edit-snippet',
      documentContainer
    );
  });

  removeSnippet = task(async () => {
    this.args.model.snippets.removeObject(this.deletingSnippet);
    this.deletingSnippet.deleteRecord();
    await this.args.model.save();
    await this.deletingSnippet.save();
    this.closeRemoveModal();
  });

  @action
  openRemoveModal(snippet) {
    this.deletingSnippet = snippet;
    this.isRemoveModalOpen = true;
  }

  @action
  closeRemoveModal() {
    this.deletingSnippet = null;
    this.isRemoveModalOpen = false;
  }
  @action
  goBack() {
    history.back();
  }
}
