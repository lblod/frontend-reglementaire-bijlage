import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class CodelistsManagementNewRoute extends Route {
  @service store;

  model() {
    return hash({
      newCodelist: this.store.createRecord('code-list', {
        createdOn: new Date(),
      }),
    });
  }
}
