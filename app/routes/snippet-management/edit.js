import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetManagementEditRoute extends Route {
  @service store;

  async model(params) {
    return await this.store.findRecord('snippet-list', params.id, {
      include: 'snippets',
    });
  }

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.model.rollbackAttributes();
    }
  }
}
