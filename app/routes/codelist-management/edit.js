import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CodelistManagementEditRoute extends Route {
  @service store;

  async model(params) {
    let codelist = await this.store.findRecord('code-list', params.id);
    let concepts = await codelist.concepts;

    return {
      codelist,
      concepts,
    };
  }
}
