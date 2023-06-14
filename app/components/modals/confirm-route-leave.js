import Component from '@glimmer/component';
import { service } from '@ember/service';
import isLoadingRoute from '../../utils/is-loading-route';

/**
 * Show a modal during a route transition that stops the transition if cancel is pressed.
 * @modal Modal component to pass with `{{component 'modal-component-name'}}`. Needs `@close` hook (passing a boolean) from ember-promise-modals!
 * @enabled Should the modal be shown on a transition
 * @onConfirm (optional) hook when confirmation is clicked
 * @onCancel (optional) hook when cancellation is clicked
 */
export default class ConfirmRouteLeaveComponent extends Component {
  @service router;
  @service modals;
  isConfirmedTransition = false;
  confirmModal = null;

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

  onConfirm(transition) {
    if (this.args.onConfirm) {
      this.args.onConfirm(transition);
    }
    this.isConfirmedTransition = true;
    transition.retry().then(() => {
      this.reset();
    });
  }

  onCancel(transition) {
    if (this.args.onCancel) {
      this.args.onCancel(transition);
    }
    this.reset();
  }

  abortTransition(transition) {
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

    if (this.confirmModal) {
      return;
    }

    this.confirmModal = this.modals
      .open(this.args.modal)
      .then((isConfirmed) => {
        if (isConfirmed) {
          this.onConfirm(transition);
        } else {
          this.onCancel(transition);
        }
      });
  }

  reset() {
    this.confirmModal = null;
    this.isConfirmedTransition = false;
  }

  willDestroy(...args) {
    this.removeExitHandler();
    super.willDestroy(...args);
  }
}
