import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';

export default class TagManagementEditRoute extends Route {
  @service declare store: Store;

  async model(params: { id: string }) {
    return this.store.findRecord('tag', params.id, {});
  }
}
