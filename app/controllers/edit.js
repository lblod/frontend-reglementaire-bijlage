import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class EditController extends Controller {
  @service store;
  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    console.log(this.model.editorDocument);
    editor.setHtmlContent(this.model.editorDocument.content);
  }

  @task
  *save() {
    const html = this.editor.htmlContent;
    console.log(html);
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = html;
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = '';
    editorDocument.previousVersion = this.model.editorDocument;
    yield editorDocument.save();
    this._editorDocument = editorDocument;

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    console.log(documentContainer);
    yield documentContainer.save();
  }
}
