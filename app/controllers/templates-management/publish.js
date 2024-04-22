import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
export default class TemplatesManagementPublishController extends Controller {
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
    const currentPublishedTemplate = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: this.model.container.id,
          },
        },
      })
    )[0];
    console.log(currentPublishedTemplate);
    if (currentPublishedTemplate) {
      const publishedVersion =
        await currentPublishedTemplate.currentVersion.reload();
      const response = await fetch(publishedVersion.downloadLink);
      this.currentVersion = await response.text();
    }
  });

  createPublishedResource = task(async () => {
    this.showPublishingModal = false;
    const taskId = await this.muTask.fetchTaskifiedEndpoint(
      `/publish-template/${this.model.container.id}`,
      { method: 'POST' },
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
      'templates-management.edit',
      this.model.container.id,
    );
  });
}
