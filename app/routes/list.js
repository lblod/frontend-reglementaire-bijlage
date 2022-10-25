import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RS_STANDARD_FOLDER } from '../utils/constants';
// eslint-disable-next-line ember/no-mixins
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
    return { sort: params.sort };
  }

  async model(params) {
    const reglements = await this.store.query('regulatory-statement', {
      filter: { folder: RS_STANDARD_FOLDER },
      include:
        'document.current-version,published-version.current-version.content',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    });
    return reglements;
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('refresh', this.refresh.bind(this));
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
