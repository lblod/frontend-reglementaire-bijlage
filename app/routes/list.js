import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service store;
  @service session;

  async model() {
    const reglements = await this.store.query('regulatory-statement', {
      include: ['document.currentVersion'],
    });
    return reglements;
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
