import { inject as service } from '@ember/service';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles = [];

  async load() {
    if (this.session.isAuthenticated) {
      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });
      this.user = await this.account.get('user');

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('administrative-unit', groupId);

      this.roles = this.session.data.authenticated.data.attributes.roles;
    }
  }
}
