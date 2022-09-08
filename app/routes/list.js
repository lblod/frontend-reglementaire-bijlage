import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
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

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
