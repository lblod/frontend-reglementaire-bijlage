import Route from '@ember/routing/route';
import { service } from '@ember/service';
import {
  DECISION_STANDARD_FOLDER,
  RS_STANDARD_FOLDER,
} from '../../utils/constants';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type SessionService from 'frontend-reglementaire-bijlage/services/app-session';
import type TemplateManagementIndexController from 'frontend-reglementaire-bijlage/controllers/template-management';
import DocumentContainerModel from 'frontend-reglementaire-bijlage/models/document-container';
import type { TemplateType } from 'frontend-reglementaire-bijlage/utils/template-type';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';

type Parameters = {
  page: number;
  size: number;
  sort: string;
  title: string;
  templateTags: string[];
  templateTypes: TemplateType[];
};

export default class TemplateManagementIndexRoute extends Route {
  @service declare store: Store;
  @service declare session: SessionService;

  queryParams = {
    title: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
    templateTypes: { refreshModel: true },
    templateTags: { refreshModel: true },
  };

  mergeQueryOptions(params: Parameters) {
    return { sort: params.sort };
  }

  async model(params: Parameters) {
    const folders =
      params.templateTypes?.length > 0
        ? params.templateTypes.map((templateType) => templateType.folder)
        : [RS_STANDARD_FOLDER, DECISION_STANDARD_FOLDER];

    const titleFilter = params.title
      ? { currentVersion: { title: params.title } }
      : ({} as Record<string, never>);
    const tagsFilter = params.templateTags?.length
      ? { tags: { ':id:': params.templateTags.join(',') } }
      : ({} as Record<string, never>);

    const [documentContainer, selectedTags] = await Promise.all([
      this.store.query<DocumentContainerModel>('document-container', {
        filter: {
          folder: {
            id: folders.join(','),
          },
          ...tagsFilter,
          ...titleFilter,
        },
        sort: params.sort,
        page: {
          number: params.page,
          size: params.size,
        },
        include: ['template', 'folder', 'currentVersion', 'tags'],
      }),
      Promise.all(
        params.templateTags?.map((id) => this.store.findRecord('tag', id)) ??
          [],
      ),
    ]);

    return {
      documentContainer,
      selectedTags,
    };
  }

  setupController(
    controller: TemplateManagementIndexController,
    model: ModelFrom<TemplateManagementIndexRoute>,
  ) {
    super.setupController(controller, model);

    controller.set('refresh', this.refresh.bind(this));
  }

  resetController(controller: TemplateManagementIndexController) {
    controller.reset();
  }
}
