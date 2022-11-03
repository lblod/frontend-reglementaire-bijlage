import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { TABLE_OF_CONTENTS_CONFIG } from '../utils/constants';

export default class EditController extends Controller {
  @service store;
  @service router;
  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.model.editorDocument.content) {
      editor.setHtmlContent(this.model.editorDocument.content);
    } else {
      editor.setHtmlContent(`
        <div typeof="https://say.data.gift/ns/DocumentContent">
          Insert here
        </div>`);
      editor.executeCommand(
        'insert-component',
        'inline-components/table-of-contents',
        { config: TABLE_OF_CONTENTS_CONFIG },
        {},
        false,
        editor.rangeFactory.fromInElement(editor.modelRoot, 0, 0)
      );
    }
  }

  @task
  *publish() {
    yield this.save.perform();
    this.router.transitionTo('publish', this.model.documentContainer.id);
  }

  @task
  *save() {
    const html = this.editor.htmlContent;
    const templateVersion = this.editor.executeCommand(
      'generateTemplate',
      this.editor
    );
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = html;
    editorDocument.templateVersion = templateVersion;
    editorDocument.createdOn = this.model.editorDocument.createdOn;
    editorDocument.updatedOn = new Date();
    editorDocument.title = this.model.editorDocument.title;
    editorDocument.previousVersion = this.model.editorDocument;
    yield editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;
    yield documentContainer.save();
  }
}
