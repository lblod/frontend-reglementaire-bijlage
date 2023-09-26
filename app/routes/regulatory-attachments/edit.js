import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class EditRoute extends Route {
  @tracked editor;
  @service store;
  @service session;
  profile = 'draftDecisionsProfile';

  async model(params) {
    const documentContainer = await this.store.findRecord(
      'document-container',
      params.id,
      { include: 'current-version,snippet-lists,snippet-lists.snippets' },
    );
    const documentId = (await documentContainer.currentVersion).id;
    const editorDocument = await this.store.findRecord(
      'editor-document',
      documentId,
    );
    return { documentContainer, editorDocument };
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('_editorDocument', '');
  }
}
