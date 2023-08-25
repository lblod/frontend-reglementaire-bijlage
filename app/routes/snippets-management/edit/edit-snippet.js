import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';
export default class SnippetsManagementEditSnippetRoute extends Route {
  @service store;
  @service session;

  async model(params) {
    return hash({
      documentContainer: (
        await this.store.query('document-container', {
          'filter[id]': params.snippet_id,
          include: 'current-version',
        })
      )[0],
      snippetList: this.modelFor('snippets-management.edit'),
    });
  }
}
