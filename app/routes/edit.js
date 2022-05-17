import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @tracked editor;
  @service store;
  @service session;
  profile = 'draftDecisionsProfile';

  async model(params) {
    const reglement = await this.store.findRecord('reglement', params.id);
    console.log(reglement);
    const containerId = (await reglement.get('document')).id;
    const documentContainer = await this.store.findRecord(
      'document-container',
      containerId
    );
    const documentId = (await documentContainer.currentVersion).id;
    const editorDocument = await this.store.findRecord(
      'editor-document',
      documentId
    );
    return { reglement, documentContainer, editorDocument };
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'mock-login');
  }
}
