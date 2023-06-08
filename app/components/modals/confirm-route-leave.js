import Component from '@glimmer/component';
import { service } from '@ember/service';
import isLoadingRoute from '../../utils/is-loading-route';

/**
 * Show a modal during a route transition that stops the transition if cancel is pressed.
 * @modal Modal component to pass with `{{component 'modal-component-name'}}`. Needs `@close` hook (passing a boolean) from ember-promise-modals!
 * @enabled Should the modal be shown on a transition
 * @onConfirm hook when confirmation is clicked
 * @onCancel hook when cancellation is clicked
 */
export default class ConfirmRouteLeaveComponent extends Component {
  @service router;
  @service modals;
  previousTransition;

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
    this.previousTransition.retry().then(() => {
      this.previousTransition = null;
    });
  }

  onCancel(transition) {
    if (this.args.onCancel) {
      this.args.onCancel(transition);
    } else {
      if (window.history) {
        window.history.forward();
      }
    }
    this.previousTransition = null;
  }

  confirm(transition) {
    if (
      this.previousTransition ||
      transition.isAborted ||
      isLoadingRoute(transition.to)
    ) {
      return;
    }
    this.previousTransition = transition;
    transition.abort();
    if (this.args.enabled) {
      this.modals.open(this.args.modal).then((isConfirmed) => {
        if (isConfirmed) {
          this.onConfirm(transition);
        } else {
          this.onCancel(transition);
        }
      });
    }
  }

  willDestroy(...args) {
    this.removeExitHandler();
    super.willDestroy(...args);
  }
}
