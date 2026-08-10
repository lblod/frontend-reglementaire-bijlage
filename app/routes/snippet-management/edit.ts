import type Controller from '@ember/controller';
import Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';

export default class SnippetManagementEditRoute extends Route {
  @service declare store: Store;

  async model(params: { id: string }) {
    return await this.store.findRecord('snippet-list', params.id, {
      include: 'snippets',
    }) as SnippetList;
  }

  resetController(controller: Controller, isExiting: boolean, transition: Transition) {
    if (isExiting && transition.targetName !== 'error') {
      (controller.model as SnippetList).rollbackAttributes();
    }
  }
}
