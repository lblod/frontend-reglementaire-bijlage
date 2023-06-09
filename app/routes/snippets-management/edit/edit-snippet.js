import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetsManagementEditSnippetRoute extends Route {
  @service store;
  @service session;

  async model(params) {
    const documentContainer = await this.store.findRecord(
      'document-container',
      params.snippet_id
    );
    return documentContainer;
  }
}
