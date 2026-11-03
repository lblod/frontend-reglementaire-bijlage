import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type SnippetManagementIndexController from 'frontend-reglementaire-bijlage/controllers/snippet-management';
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
    const publisherId = this.currentSession.group?.id;
    const publisherFilter = publisherId
      ? { publisher: { id: publisherId } }
      : ({} as Record<string, never>);
    const labelFilter = params.label
      ? { label: params.label }
      : ({} as Record<string, never>);
    const tagsFilter = params.tags?.length
      ? { tags: { ':id:': params.tags.join(',') } }
      : ({} as Record<string, never>);
    const options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        ...publisherFilter,
        ...labelFilter,
        ...tagsFilter,
      },
    };

    const [snippetLists, allTags] = await Promise.all([
      this.store.query<SnippetList>('snippet-list', options),
      this.store.countAndFetchAll<Tag>('tag', {}),
    ]);

    const selectedTags = allTags.filter((tag) =>
      tag.id ? params.tags.includes(tag.id) : false,
    );

    return {
      snippetLists,
      selectedTags,
      allTags,
    };
  }

  resetController(controller: SnippetManagementIndexController) {
    controller.reset();
  }
}
