import Component from '@glimmer/component';
import { action } from '@ember/object';
import insertTitle from '../commands/insert-title';
import { inject as service } from '@ember/service';

export default class InsertTitleCardComponent extends Component {
  @service intl;

  @action
  insertTitle() {
    this.args.controller.doCommand(insertTitle(this.intl), {
      view: this.args.controller.mainEditorView,
    });
    //this.args.controller.focus();
  }

  canInsertTitle = () =>
    this.args.controller.checkCommand(insertTitle(this.intl), {
      view: this.args.controller.mainEditorView,
    });
}
