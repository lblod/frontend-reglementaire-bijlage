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
        reload: true,
      },
    );
    const templateVersion = await this.store
      .query('template', {
        filter: {
          'derived-from': {
            id: documentContainer.id,
          },
        },
        // See template-management/index.js for details of this hack
        avoid_cache: new Date().toISOString(),
        include: 'current-version',
      })
      .then((templates) => templates[0]?.currentVersion);
    return hash({
      documentContainer,
      editorDocument: documentContainer.currentVersion,
      templateTypeId: documentContainer.templateTypeId,
      templateVersion,
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.set('_editorDocument', '');
  }
}
