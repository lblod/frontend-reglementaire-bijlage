import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class CodelistsManagementCodelistRoute extends Route {
  @service store;

  async model(params) {
    let model = await hash({
      codelist: this.store.findRecord('code-list', params.id),
    });

    return model;
  }

  resetController(controller) {
    controller.reset();
  }
}
