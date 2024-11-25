import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class TemplateManagementEditRoute extends Route {
  @tracked editor;
  @service store;
  @service session;
  profile = 'draftDecisionsProfile';

  async model(params) {
    const documentContainer = await this.store.findRecord(
      'document-container',
      params.id,
      {
        include: 'current-version,folder',
      },
    );
    return hash({
      documentContainer,
      editorDocument: documentContainer.currentVersion,
      templateTypeId: documentContainer.templateTypeId,
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('_editorDocument', '');
  }
}
