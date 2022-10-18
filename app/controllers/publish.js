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
    const publishedVersionContainer = yield this.model.reglement
      .publishedVersion;
    if (publishedVersionContainer) {
      const publishedVersion = yield publishedVersionContainer.currentVersion;
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
    this.fetchPreview.perform();
    this.router.transitionTo('edit', this.model.reglement.id);
  }
}
