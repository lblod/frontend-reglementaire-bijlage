import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class EditController extends Controller {
  @service store;
  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.model.editorDocument.content) {
      editor.setHtmlContent(this.model.editorDocument.content);
    } else {
      editor.executeCommand(
        'insert-component',
        'inline-components/table-of-contents',
        {},
        {},
        false
      );
    }
  }

  @task
  *save() {
    const html = this.editor.htmlContent;
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = html;
    editorDocument.createdOn = this.model.editorDocument.createdOn;
    editorDocument.updatedOn = new Date();
    editorDocument.title = this.model.editorDocument.title;
    editorDocument.previousVersion = this.model.editorDocument;
    yield editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    yield documentContainer.save();
  }
  toggleDeleteModal() {
    console.log('delete');
  }
}
