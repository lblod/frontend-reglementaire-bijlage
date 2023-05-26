import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetsManagementEditRoute extends Route {
  @service store;

  async model(params) {
    let snippetList = await this.store.findRecord('snippet-list', params.id);
    await snippetList.snippets;
    console.log(snippetList.snippets.toArray());
    return snippetList;
  }
}
