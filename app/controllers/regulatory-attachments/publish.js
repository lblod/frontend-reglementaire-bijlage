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

  fetchPreview = task(async () => {
    this.currentVersion = '';
    const publishedVersionContainer =
      await this.model.container.publishedVersion.reload();
    if (publishedVersionContainer) {
      const publishedVersion =
        await publishedVersionContainer.currentVersion.reload();
      const response = await fetch(publishedVersion.downloadLink);
      this.currentVersion = await response.text();
    }
  });

  createPublishedResource = task(async () => {
    this.showPublishingModal = false;
    const body = {
      data: {
        relationships: {
          'document-container': {
            data: {
              id: this.model.container.id,
            },
          },
        },
      },
    };

    const taskId = await this.muTask.fetchTaskifiedEndpoint(
      '/regulatory-attachment-publication-tasks',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      },
    );
    await this.muTask.waitForMuTaskTask.perform(taskId, 100);
    await this.fetchPreview.perform();
    this.toaster.success(
      this.intl.t('publish-page.notification-content'),
      this.intl.t('publish-page.notification-title'),
      {
        timeOut: 3000,
      },
    );
    this.router.transitionTo(
      'regulatory-attachments.edit',
      this.model.container.id,
    );
  });
}
