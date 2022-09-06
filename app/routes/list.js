import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RS_STANDARD_FOLDER } from '../utils/constants';

export default class ListRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
  };

  async model() {
    const reglements = await this.store.query('regulatory-statement', {
      filter: { folder: RS_STANDARD_FOLDER },
      include: ['document.currentVersion'],
    });
    return reglements;
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
