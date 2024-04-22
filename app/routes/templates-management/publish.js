import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TemplatesManagementPublishRoute extends Route {
  @service session;
  @service store;

  async model(params) {
    const container = await this.store.findRecord(
      'document-container',
      params.id,
      { reload: true },
    );
    const currentVersion = await container.currentVersion;
    const templateVersion = await currentVersion.templateVersion;
    return { container, templateVersion };
  }
}
