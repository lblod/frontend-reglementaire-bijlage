import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import Tag from 'frontend-reglementaire-bijlage/models/tag';
import type CodelistManagementIndexController from 'frontend-reglementaire-bijlage/controllers/codelist-management';
import CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';

type Parameters = {
  page: number;
  size: number;
  sort: string;
  label: string;
  tags: string[];
};

export default class CodelistManagementIndexRoute extends Route {
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

    const [codelists, allTags] = await Promise.all([
      this.store.query<CodeListModel>('code-list', options),
      this.store.countAndFetchAll<Tag>('tag', {}),
    ]);

    const selectedTags = allTags.filter((tag) =>
      tag.id ? params.tags.includes(tag.id) : false,
    );

    return {
      codelists,
      selectedTags,
    };
  }

  resetController(controller: CodelistManagementIndexController) {
    controller.reset();
  }
}
