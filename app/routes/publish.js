import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublishRoute extends Route {
  @service session;

  async model(params) {
    const container = await this.store.findRecord(
      'document-container',
      params.id,
      { reload: true }
    );
    const currentVersion = await container.get('currentVersion');
    const templateVersion = await currentVersion.get('templateVersion');
    return { container, templateVersion };
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
