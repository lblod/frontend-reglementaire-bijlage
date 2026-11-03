import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service currentSession;
  @service tagManager
  
  async beforeModel() {
    await this.session.setup();
    await this.loadCurrentSession();
    await this.tagManager.loadTags();
  }

  loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  }
}
