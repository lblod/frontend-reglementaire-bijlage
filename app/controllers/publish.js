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
    try {
      this.currentVersion = '';
      const reglement = yield this.model.reglement;
      const publishedVersion = yield reglement.publishedVersion;
      // const publishedVersionContent = yield publishedVersion.currentVersion;
      console.log('PUBLISHED VERSION: ', publishedVersion);
      // const id = this.model.id;
    } catch (e) {
      console.log('error');
      console.log(e);
    }
    //const response = yield fetch(`/preview/regulatory-attachment/${id}`);
    //const json = yield response.json();
    this.currentVersion = 'Preview';
  }

  @task
  *createPublishedResource() {
    this.showPublishingModal = false;
    const publicationTask = this.store.createRecord(
      'regulatory-attachment-publication-task'
    );
    publicationTask.regulatoryAttachment = this.model.reglement;
    yield publicationTask.save();
    // this.router.transitionTo('edit', this.model.id);
  }
}
