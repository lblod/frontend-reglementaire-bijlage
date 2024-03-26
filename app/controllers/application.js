import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';

export default class ApplicationController extends Controller {
  @service store;
  @service session;
  @service currentSession;
  @service router;

  @action
  logout() {
    this.session.invalidate();
  }

  get environmentName() {
    return getOwner(this).resolveRegistration('config:environment')
      .environmentName;
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }

  get showBreadcrumbsToolbar() {
    return (
      this.session.isAuthenticated && this.router.currentRouteName !== 'index'
    );
  }
}
