import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetsManagementEditSnippetRoute extends Route {
  @service store;
  @service session;

  async model(params) {
    const container = await this.store.query('document-container', {
      'filter[id]': params.snippet_id,
      include: 'current-version',
    });
    return container[0];
  }
}
