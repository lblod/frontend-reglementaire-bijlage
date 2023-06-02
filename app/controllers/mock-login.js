import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task, restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';

export default class MockLoginController extends Controller {
  queryParams = ['municipality', 'page'];
  @service store;
  @tracked municipality = '';
  @tracked page = 0;
  @tracked size = 10;

  get accounts() {
    return this.model;
  }

  queryStore = task(async () => {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (this.municipality) filter.user = { 'family-name': this.municipality };
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: this.size, number: this.page },
      sort: 'user.familyName',
    });
    return accounts;
  });

  updateSearch = restartableTask(async (value) => {
    await timeout(500);
    this.page = 0;
    this.municipality = value;
    this.model = await this.queryStore.perform();
  });

  getGroup = async (account) => {
    const user = await account.user;
    return (await user.groups)[0];
  };
}
