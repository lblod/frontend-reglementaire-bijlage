import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PublishController extends Controller {
  @service store;
  @service router;
  @service session;
  @service currentSession;
  @service muTask;
  @tracked currentVersion;

  constructor() {
    super(...arguments);
  }

  @task
  *fetchPreview() {
    const id = this.model.id;
    const response = yield fetch(`/preview/regulatory-attachment/${id}`);
    const json = yield response.json();
    this.currentVersion = json.content;
  }

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
  }
}
