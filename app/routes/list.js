import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { RS_STANDARD_FOLDER } from '../utils/constants';

export default class ListRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    title: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    return { sort: params.sort };
  }

  async model(params) {
    const options = {
      filter: {
        folder: RS_STANDARD_FOLDER,
      },
      include:
        'document.current-version,published-version.current-version.content',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };

    if (params.title) {
      options['filter[document][current-version][title]'] = params.title;
    }

    return await this.store.query('regulatory-statement', options);
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('refresh', this.refresh.bind(this));
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
