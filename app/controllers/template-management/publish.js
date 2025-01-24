import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { getTemplateType } from '../../utils/template-type';

export default class TemplateManagementPublishController extends Controller {
  @service store;
  @service router;
  @service session;
  @service currentSession;
  @service muTask;
  @service toaster;
  @service intl;

  @tracked currentVersion;
  @tracked currentVersionValidThrough;

  fetchPreview = task(async () => {
    this.currentVersion = '';
    this.currentVersionValidThrough = undefined;
    const currentPublishedTemplate = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: this.model.container.id,
          },
        },
        include: 'current-version',
      })
    )[0];
    if (currentPublishedTemplate) {
      const publishedVersion = await currentPublishedTemplate.currentVersion;
      const response = await fetch(publishedVersion.downloadLink);
      this.currentVersionValidThrough =
        publishedVersion.validThrough &&
        new Date(publishedVersion.validThrough);
      this.currentVersion = await response.text();
    }
  });

  createPublishedResource = task(async () => {
    this.showPublishingModal = false;
    const taskId = await this.muTask.fetchTaskifiedEndpoint(
      `/publish-template/${this.model.container.id}`,
      { method: 'POST' },
    );
    await this.muTask.waitForMuTaskTask.perform(taskId, {}, 100);
    await this.fetchPreview.perform();
    this.toaster.success(
      this.intl.t('publish-page.notification-content'),
      this.intl.t('publish-page.notification-title'),
      {
        timeOut: 3000,
      },
    );
    this.router.transitionTo(
      'template-management.edit',
      this.model.container.id,
    );
  });

  get templateTypeLabel() {
    return getTemplateType(this.model.templateTypeId, this.intl)?.label;
  }
}
