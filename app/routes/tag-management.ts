import type Store from '@ember-data/store';
import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type TagManagementController from 'frontend-reglementaire-bijlage/controllers/tag-management';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type SessionService from 'frontend-reglementaire-bijlage/services/app-session';
import { hash } from 'rsvp';
import TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

type Parameters = {
  value: string;
  page: number;
  size: number;
  sort: string;
};

export default class TagManagementRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare session: SessionService;

  queryParams = {
    value: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params: Parameters) {
    const filter: Record<string, string> = {};
    if (params.value) {
      filter['value'] = params.value;
    }
    const query = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter,
    };

    return hash({
      templateTags: this.store.query<TemplateTag>('template-tag', query),
    });
  }

  resetController(controller: TagManagementController) {
    controller.reset();
  }
}
