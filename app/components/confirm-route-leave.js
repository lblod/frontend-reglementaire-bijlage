import Component from '@glimmer/component';
import { service } from '@ember/service';
import isLoadingRoute from '../utils/is-loading-route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Show a modal during a route transition that stops the transition if cancel is pressed.
 * By default it will show a message to confirm to discard unsaved changes.
 * @message (optional) the message to show in the modal
 * @confirmMessage (optional) the text to show in the confirm button
 * @enabled Should the modal be shown on a transition
 * @onConfirm (optional) hook when confirmation is clicked
 * @onCancel (optional) hook when cancellation is clicked
 */
export default class ConfirmRouteLeaveComponent extends Component {
  @service router;
  isConfirmedTransition = false;
  @tracked showConfirmModal = false;
  lastTransition = null;

  constructor(...args) {
    super(...args);
    this.addExitHandler();
  }

  addExitHandler() {
    this.router.on('routeWillChange', this, this.confirm);
  }

  removeExitHandler() {
    this.router.off('routeWillChange', this, this.confirm);
  }

  @action
  onConfirm() {
    if (this.args.onConfirm) {
      this.args.onConfirm(this.lastTransition);
    }
    this.isConfirmedTransition = true;
    this.lastTransition.retry().then(() => {
      this.reset();
    });
  }

  @action
  onCancel() {
    if (this.args.onCancel) {
      this.args.onCancel(this.lastTransition);
    }
    this.reset();
  }

  abortTransition(transition) {
    if(transition?.to?.queryParams?.overrideConfirm) {
      return;
    }
    transition.abort();
    if (window.history) {
      window.history.forward();
    }
  }

  confirm(transition) {
    if (
      this.isConfirmedTransition ||
      !this.args.enabled ||
      transition.isAborted ||
      isLoadingRoute(transition.to)
    ) {
      return;
    }

    this.abortTransition(transition);

    if (this.showConfirmModal) {
      return;
    }
    this.lastTransition = transition;
    this.showConfirmModal = true;
  }

  reset() {
    this.showConfirmModal = false;
    this.isConfirmedTransition = false;
    this.lastTransition = null;
  }

  willDestroy(...args) {
    this.removeExitHandler();
    super.willDestroy(...args);
  }
}
