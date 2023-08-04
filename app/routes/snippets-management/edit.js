import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetsManagementEditRoute extends Route {
  @service store;

  async model(params) {
    return await this.store.findRecord('snippet-list', params.id, {
      include: 'snippets,templates,templates.current-version',
    });
  }

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.model.rollbackAttributes();
    }
  }
}
