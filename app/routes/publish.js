import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublishRoute extends Route {
  @service session;

  async model(params) {
    const reglement = (
      await this.store.query('regulatory-statement', {
        'filter[:id:]': params.id,
        include: ['document.currentVersion'],
      })
    ).firstObject;
    const document = await reglement.get('document');
    const currentVersion = await document.get('currentVersion');
    const templateVersion = await currentVersion.get('templateVersion')
    console.log(templateVersion);
    return { id: params.id, templateVersion };
  }
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}