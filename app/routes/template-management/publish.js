import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class TemplateManagementPublishRoute extends Route {
  @service session;
  @service store;

  async model(params) {
    const container = await this.store.findRecord(
      'document-container',
      params.id,
      { include: 'current-version,folder', reload: true },
    );

    return hash({
      container,
      currentVersion: container.currentVersion,
      templateTypeId: container.templateTypeId,
    });
  }
}
