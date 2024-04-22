import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  DECISION_STANDARD_FOLDER,
  RS_STANDARD_FOLDER,
} from '../../utils/constants';

export default class TemplatesManagementIndexRoute extends Route {
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
    const folders = [RS_STANDARD_FOLDER, DECISION_STANDARD_FOLDER];
    const options = {
      filter: {
        folder: {
          id: folders.join(','),
        },
      },
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };

    if (params.title) {
      options['filter[current-version][title]'] = params.title;
    }

    return await this.store.query('document-container', options);
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('refresh', this.refresh.bind(this));
  }
}
