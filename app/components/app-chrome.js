import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AppChromeComponent extends Component {
  @service currentSession;
  @service features;

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

  @action
  async updateDocumentTitle(title) {
    this.args.editorDocument.title = title;
  }

  @action
  async saveDocument() {
    this.args.editorDocument.save();
  }
}
