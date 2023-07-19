import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CodelistsManagementNewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
    );
    const snippetList = this.store.createRecord('snippet-list', {
      createdOn: new Date(),
      publisher: administrativeUnit,
    });
    return snippetList;
  }
}
