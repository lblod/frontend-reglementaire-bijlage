import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class SnippetsManagementIndexController extends Controller {
  @service store;
  @service router;
  @service currentSession;
  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked label = '';
  @tracked sort = '-created-on';

  createSnippetList = task(async () => {
    const administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id
    );
    const snippetList = this.store.createRecord('snippet-list', {
      createdOn: new Date(),
      publisher: administrativeUnit,
    });
    await snippetList.save();
    this.router.transitionTo('snippets-management.edit', snippetList);
  });

  removeSnippetList = task(async (snippet) => {
    snippet.deleteRecord();
    await snippet.save();
  });
}
