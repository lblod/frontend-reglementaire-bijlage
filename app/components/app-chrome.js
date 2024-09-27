import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { getTemplateType } from '../utils/template-type';
import EditorDocumentModel from '../models/editor-document';
import SnippetVersionModel from '../models/snippet-version';

export default class AppChromeComponent extends Component {
  @service currentSession;
  @service features;
  @service intl;
  @service router;

  get editorDocument() {
    return this.args.editorDocument;
  }

  get documentContainer() {
    return this.args.documentContainer;
  }

  get documentStatus() {
    const status = this.documentContainer?.get('status');
    return status;
  }

  get updatedOn() {
    if (this.editorDocument instanceof EditorDocumentModel) {
      return this.editorDocument.updatedOn;
    } else if (this.editorDocument instanceof SnippetVersionModel) {
      return this.editorDocument.createdOn;
    } else {
      return null;
    }
  }

  templateTypeLabel =
    this.args.templateTypeId &&
    getTemplateType(this.args.templateTypeId, this.intl)?.label;

  get showFileDropdown() {
    return (
      this.args.copyAgendapunt ||
      this.args.exportHtmlFunction ||
      this.args.sendToTrash
    );
  }

  updateDocumentTitle = task(async (title) => {
    console.log('Update title: ', title);
    this.editorDocument.title = title;
    await this.editorDocument.save();

    if (this.args.onUpdateDocumentTitle) {
      await this.args.onUpdateDocumentTitle();
    }
  });

  resetDocument = task(async () => {
    this.editorDocument.rollbackAttributes();
  });
}
