import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class PublishController extends Controller {
  @service store;
  @service session;
  @service currentSession;
  @service muTask;

  @task
  *createPublishedResource() {
    this.showPublishingModal = false;
    const id = this.model.id;
    const taskId = yield this.muTask.fetchTaskifiedEndpoint(
      `/publish/regulatory-attachment/${id}`,
      {
        method: 'POST',
      }
    );
    yield this.muTask.waitForMuTaskTask.perform(taskId);
    yield this.loadNotulen.perform();
  }
}
