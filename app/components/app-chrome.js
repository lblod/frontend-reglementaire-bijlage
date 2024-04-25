import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import {
  DECISION_STANDARD_FOLDER,
  RS_STANDARD_FOLDER,
} from '../utils/constants';

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

  templateType = trackedFunction(this, async () => {
    const folder = await this.documentContainer?.folder;
    if (folder?.id === RS_STANDARD_FOLDER) {
      return this.intl.t(
        'template-management.template-type.regulatory-attachment',
      );
    } else if (folder?.id === DECISION_STANDARD_FOLDER) {
      return this.intl.t('template-management.template-type.decision');
    }
  });

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
