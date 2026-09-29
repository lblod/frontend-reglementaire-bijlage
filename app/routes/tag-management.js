import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class TagManagementRoute extends Route {
  @service store;
  @service currentSession;
  @service session;

  queryParams = {
    label: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    let query = {
      sort: params.sort,
      filter: {},
    };
    if (params.label) {
      query.filter.label = params.label;
    }

    return hash({
      templateTags: this.store.query('template-tag', query),
    });
  }

  resetController(controller) {
    controller.reset();
  }
}
