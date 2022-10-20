import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
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
    this.currentVersion = '';
    const publishedVersionContainer =
      yield this.model.reglement.publishedVersion.reload();
    if (publishedVersionContainer) {
      const publishedVersion =
        yield publishedVersionContainer.currentVersion.reload();
      const publishedVersionContent = yield publishedVersion.content;
      const response = yield fetch(publishedVersionContent.downloadLink);
      this.currentVersion = yield response.text();
    }
  }

  @task
  *createPublishedResource() {
    this.showPublishingModal = false;
    const publicationTask = this.store.createRecord(
      'regulatory-attachment-publication-task'
    );
    publicationTask.regulatoryAttachment = this.model.reglement;
    yield publicationTask.save();
    yield this.muTask.waitForMuTaskTask.perform(publicationTask.id, 100);
    yield this.fetchPreview.perform();
  }
}
