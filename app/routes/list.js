import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service store;
  async model() {
    const reglements = await this.store.findAll('reglement');
    return reglements;
  }
}
