import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service currentSession;
  async beforeModel() {
    await this.session.setup();
    return this.loadCurrentSession();
  }

  loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  }
}
