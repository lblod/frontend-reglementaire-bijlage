import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { hash } from 'rsvp';
import type SessionService from 'frontend-reglementaire-bijlage/services/session';
import type Snippet from 'frontend-reglementaire-bijlage/models/snippet';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import type SnippetManagementEditRoute from '../edit';

export default class SnippetManagementEditSnippetRoute extends Route {
  @service declare store: Store;
  @service declare session: SessionService;

  async model(params: { snippet_id: string }) {
    return hash({
      snippet: (
        await this.store.query('snippet', {
          'filter[:id:]': params.snippet_id,
          include: 'current-version',
        })
      )[0] as Snippet,
      snippetList: this.modelFor('snippet-management.edit') as ModelFrom<SnippetManagementEditRoute>,
    });
  }
}
