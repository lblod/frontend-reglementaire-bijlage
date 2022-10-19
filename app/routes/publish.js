import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublishRoute extends Route {
  @service session;

  async model(params) {
    console.log('MODEL');
    const reglement = await this.store.findRecord(
      'regulatory-statement',
      params.id,
      { reload: true }
    );
    const document = await reglement.get('document');
    const currentVersion = await document.get('currentVersion');
    const templateVersion = await currentVersion.get('templateVersion');
    return { reglement: reglement, templateVersion };
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
