import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type Store from 'frontend-reglementaire-bijlage/services/store';

type Parameters = {
  page: number;
  size: number;
  sort: string;
  label: string;
  tags: string[];
};

export default class SnippetManagementIndexRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    label: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    tags: { refreshModel: true },
  };

  async model(params: Parameters) {
    const options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        publisher: {
          id: this.currentSession.group?.id,
        },
        label: undefined as string | undefined,
        tags: {
          ':id:': undefined as string | undefined,
        },
      },
    };

    if (params.label) {
      options.filter.label = params.label;
    }

    if (params.tags?.length) {
      options.filter.tags[':id:'] = params.tags.join(',');
    }

    const [snippetLists, allTags]: [SnippetList[], Tag[]] = await Promise.all([
      this.store.query<SnippetList>('snippet-list', options),
      this.store.countAndFetchAll('tag', {}),
    ]);

    const selectedTags = allTags.filter((tag) => params.tags.includes(tag.id));

    return {
      snippetLists,
      selectedTags,
      // allTags,
    };
  }
}
