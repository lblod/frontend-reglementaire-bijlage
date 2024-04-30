import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { getTemplateType } from '../utils/template-type';

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
