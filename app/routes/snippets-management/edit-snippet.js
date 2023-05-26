import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SnippetsManagementEditSnippetRoute extends Route {
  @service store;
  @service session;

  async model(params) {
    const documentContainer = await this.store.findRecord(
      'document-container',
      params.id
    );
    console.log(documentContainer.currentVersion);
    const documentId = (await documentContainer.currentVersion).id;
    console.log(documentId);
    const editorDocument = await this.store.findRecord(
      'editor-document',
      documentId
    );
    return { documentContainer, editorDocument };
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
