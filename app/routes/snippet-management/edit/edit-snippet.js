import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class SnippetManagementEditSnippetRoute extends Route {
  @service store;
  @service session;

  async model(params) {
    return hash({
      snippet: (
        await this.store.query('snippet', {
          'filter[:id:]': params.snippet_id,
          include: 'current-version',
        })
      )[0],
      snippetList: this.modelFor('snippet-management.edit'),
    });
  }
}
