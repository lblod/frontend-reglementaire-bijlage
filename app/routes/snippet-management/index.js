import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetManagementIndexRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let query = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        publisher: {
          id: this.currentSession.group.id,
        },
      },
    };

    return this.store.query('snippet-list', query);
  }
}
