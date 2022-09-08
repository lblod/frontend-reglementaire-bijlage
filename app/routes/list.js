import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RS_STANDARD_FOLDER } from '../utils/constants';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class ListRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'regulatory-statement';
  @service store;
  @service session;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    console.log(params);
    return { sort: params.sort };
  }
  
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
