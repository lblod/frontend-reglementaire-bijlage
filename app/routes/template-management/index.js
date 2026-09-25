import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  DECISION_STANDARD_FOLDER,
  RS_STANDARD_FOLDER,
} from '../../utils/constants';

export default class TemplateManagementIndexRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    title: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
    templateTypes: { refreshModel: true },
    templateTags: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    return { sort: params.sort };
  }

  async model(params) {
    const folders =
      params.templateTypes?.length > 0
        ? params.templateTypes.map((templateType) => templateType.folder)
        : [RS_STANDARD_FOLDER, DECISION_STANDARD_FOLDER];
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
      include: 'template,folder,current-version,template.tags',
    };

    if (params.title) {
      options['filter[current-version][title]'] = params.title;
    }
    if (params.templateTags?.length) {
      options['filter[template][tags][:id:]'] = params.templateTags.join(',');
    }
    return await this.store.query('document-container', options);
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('refresh', this.refresh.bind(this));
  }
}
