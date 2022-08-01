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

  @action
  updateDocumentTitle(title) {
    this.args.editorDocument.title = title;
  }
}
