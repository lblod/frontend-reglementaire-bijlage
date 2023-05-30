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

  @task
  *createSnippetList() {
    const administrativeUnit = yield this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id
    );
    const snippetList = this.store.createRecord('snippet-list', {
      createdOn: new Date(),
      publisher: administrativeUnit,
    });
    yield snippetList.save();
    console.log(snippetList);
    this.router.transitionTo('snippets-management.edit', snippetList);
  }
  @task
  *removeSnippetList(snippet) {
    snippet.deleteRecord();
    yield snippet.save();
  }
}
