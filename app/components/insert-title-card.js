import Component from '@glimmer/component';
import { action } from '@ember/object';
import insertTitle from '../commands/insert-title';
import { inject as service } from '@ember/service';

export default class InsertTitleCardComponent extends Component {
  @service intl;

  @action
  insertTitle() {
    this.args.controller.doCommand(
      insertTitle(this.intl.t('reglement-edit.document-title-placeholder')),
      {
        view: this.args.controller.mainEditorView,
      }
    );
    this.args.controller.focus();
  }

  get canInsertTitle() {
    return this.args.controller.checkCommand(
      insertTitle(this.intl.t('reglement-edit.document-title-placeholder')),
      {
        view: this.args.controller.mainEditorView,
      }
    );
  }
}
