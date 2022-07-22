import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CodelistsManagementIndexController extends Controller {
  queryParams = ['page', 'size', 'label', 'sort'];

  @tracked page = 0;
  @tracked size = 30;
  @tracked label = '';
  @tracked sort = 'label';

  @restartableTask
  *updateSearchFilterTask(queryParamProperty, event) {
    yield timeout(300);

    this[queryParamProperty] = event.target.value.trim();
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }
}
