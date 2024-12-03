import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * A generic 'confirmation' modal to avoid copy-pasting boilerplate and to keep a consistent style.
 * @title the title to give for the modal
 * @message (optional) the message to show in the modal
 * @confirmMessage (optional) the text to show in the confirm button
 * @isAlert (optional) should the confirmation button be styled as an 'alert'
 * @modalOpen boolean flag setting the open state of the modal
 * @closeModal callback to trigger closing of the modal
 * @onConfirm (optional) hook when confirmation is clicked
 * @onCancel (optional) hook when cancellation is clicked or modal is closed
 */
export default class ConfirmModelComponent extends Component {
  @action
  onConfirm() {
    if (this.args.onConfirm) {
      this.args.onConfirm();
    }
    this.args.closeModal();
  }

  @action
  onCancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    this.args.closeModal();
  }
}
