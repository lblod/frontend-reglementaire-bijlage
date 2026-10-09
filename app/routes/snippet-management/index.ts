import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type Store from 'frontend-reglementaire-bijlage/services/store';

type Parameters = {
  page: number;
  size: number;
  sort: string;
  label: string;
};

export default class SnippetManagementIndexRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    label: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params: Parameters) {
    const query = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        publisher: {
          id: this.currentSession.group?.id,
        },
        label: undefined as undefined | string,
      },
    };

    if (params.label) {
      query.filter.label = params.label;
    }

    return this.store.query<SnippetList>('snippet-list', query);
  }
}
