import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
export default class PublishController extends Controller {
  @service store;
  @service router;
  @service session;
  @service currentSession;
  @service muTask;
  @service toaster;
  @service intl;

  @tracked currentVersion;

  constructor() {
    super(...arguments);
  }

  @task
  *fetchPreview() {
    this.currentVersion = '';
    const publishedVersionContainer =
      yield this.model.container.publishedVersion.reload();
    if (publishedVersionContainer) {
      const publishedVersion =
        yield publishedVersionContainer.currentVersion.reload();
      const response = yield fetch(publishedVersion.downloadLink);
      this.currentVersion = yield response.text();
    }
  }

  @task
  *createPublishedResource() {
    this.showPublishingModal = false;
    const publicationTask = this.store.createRecord(
      'regulatory-attachment-publication-task'
    );
    publicationTask.documentContainer = this.model.container;
    yield publicationTask.save();
    yield this.muTask.waitForMuTaskTask.perform(publicationTask.id, 100);
    yield this.fetchPreview.perform();
    this.toaster.success(
      this.intl.t('publishPage.notificationContent'),
      this.intl.t('publishPage.notificationTitle'),
      {
        timeOut: 3000,
      }
    );
    this.router.transitionTo('edit', this.model.container.id);
  }
}
