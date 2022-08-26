import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublishRoute extends Route {
  @service session;

  async model(params) {
    return { id: params.id };
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
