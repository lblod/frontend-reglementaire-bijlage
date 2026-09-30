import type Store from '@ember-data/store';
import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type TagManagementController from 'frontend-reglementaire-bijlage/controllers/tag-management';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type SessionService from 'frontend-reglementaire-bijlage/services/app-session';
import { hash } from 'rsvp';

interface Parameters {
  label?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export default class TagManagementRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare session: SessionService;

  queryParams = {
    label: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params: Parameters) {
    const filter: Record<string, string> = {};
    if (params.label) {
      filter['label'] = params.label;
    }
    const query = {
      sort: params.sort,
      filter,
    };

    return hash({
      templateTags: this.store.query('template-tag', query),
    });
  }

  resetController(controller: TagManagementController) {
    controller.reset();
  }
}
