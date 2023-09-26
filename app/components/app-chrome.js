import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AppChromeComponent extends Component {
  @service currentSession;
  @service features;
  @service intl;
  @service router;

  get documentStatus() {
    const status = this.args.documentContainer?.get('status');
    return status;
  }

  get showFileDropdown() {
    return (
      this.args.copyAgendapunt ||
      this.args.exportHtmlFunction ||
      this.args.sendToTrash
    );
  }

  updateDocumentTitle = task(async (title) => {
    this.args.editorDocument.title = title;
    await this.args.editorDocument.save();

    if (this.args.onUpdateDocumentTitle) {
      await this.args.onUpdateDocumentTitle();
    }
  });

  resetDocument = task(async () => {
    this.args.editorDocument.rollbackAttributes();
  });
}
