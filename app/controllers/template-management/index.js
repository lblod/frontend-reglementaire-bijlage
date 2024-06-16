import Controller from '@ember/controller';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '../../utils/strings';
import { getTemplateType, getTemplateTypes } from '../../utils/template-type';

export default class TemplateManagementIndexController extends Controller {
  @service store;
  @service session;
  @service router;
  @service currentSession;
  @service muTask;
  @service intl;

  @tracked page = 0;
  @tracked size = 20;
  @tracked title = '';
  @tracked debounceTime = 2000;
  @tracked editorDocument;
  @tracked documentContainer;
  @tracked templateTypeToCreate = this.templateTypes[0];
  @tracked createTemplateModalIsOpen;
  @tracked removeTemplateModalIsOpen;
  sort = '-current-version.created-on';

  templateTypes = getTemplateTypes(this.intl);

  @action
  updateTemplateType(templateType) {
    this.templateTypeToCreate = templateType;
  }

  getTemplateTypeLabel = async (documentContainer) => {
    const type = await documentContainer.templateTypeId;
    return getTemplateType(type, this.intl)?.label;
  };

  lastPublicationDate = async (documentContainer) => {
    // start of shenanigans
    /*
    The following query and subsequent relationship access are a horrible house of cards.

    Here's the problem:
    We create a published version using a backend service that's not mu-cl-resources.
    This means that in order for the cache to invalidate, it needs to get a delta from mu-auth.
    This takes some time (unsure how much, likely in the order of 500 - 1000 ms, depending on server load)

    This means that when we query for the newly published document, we get a bogus cache response.

    There is currently no good way to avoid this, so we use a horrible way: by adding a nonsense query param
    that is guaranteed to change every request.

    This is still not enough, however. Because we later need to access a relationship, ED's own caching
    will kick in. So we'd still get the old version, because ED wouldn't even bother to send the request.

    Normally, you'd avoid this by forcing ED to reload the relationship using belongsTo('currentVersion').reload().
    HOWEVER, this _again_ doesn't work cause there seems to be no remotely sane way to force ED to include a
    query param in the request it sends for a belongsTo relationship (and yes, I've tried extending the adapter,
    it's simply not set up to do this).

    So the ONLY way this works, is by forcing ED to reload the relationship data in the below query first, after
    which the relationship access will load correctly.
     */
    const publishedTemplate = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: documentContainer.id,
          },
        },
        // the abovementioned bogus query param
        avoid_cache: new Date().toISOString(),
        // as mentioned above, without this we still get stale data
        include: 'current-version',
      })
    )[0];
    if (publishedTemplate) {
      // normally you'd force a reload here, but the reload's option passing mechanism ignores any query
      // params you add
      const templateVersion = await publishedTemplate.currentVersion;
      // end of shenanigans
      return templateVersion.created;
    } else {
      return;
    }
  };

  @action
  startCreateTemplateFlow() {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = '';
    this.editorDocument = editorDocument;
    this.documentContainer = documentContainer;

    documentContainer.currentVersion = editorDocument;

    this.createTemplateModalIsOpen = true;
  }

  @action
  cancelCreateTemplate() {
    this.editorDocument = undefined;
    this.documentContainer = undefined;
    this.folder = this.templateTypes[0];
    this.createTemplateModalIsOpen = false;
  }

  get isInvalidTemplateTitle() {
    return isBlank(this.editorDocument.title);
  }

  saveTemplate = task(async (event) => {
    event.preventDefault();
    await this.editorDocument.save();
    const folder = await this.store.findRecord(
      'editor-document-folder',
      this.templateTypeToCreate.folder,
    );
    this.documentContainer.folder = folder;
    await this.documentContainer.save();
    this.createTemplateModalIsOpen = false;
    this.router.transitionTo(
      'template-management.edit',
      this.documentContainer.id,
    );
  });

  @action
  startRemoveTemplateFlow(documentContainer) {
    this.removeTemplateModalIsOpen = true;
    this.documentContainer = documentContainer;
  }

  @action
  cancelRemoveTemplate() {
    this.editorDocument = undefined;
    this.removeTemplateModalIsOpen = false;
  }

  submitRemoveTemplate = task(async () => {
    // this is currenlty a hard-delete of the container, but a soft-delete of the
    // publishedVersion, since GN filters on the validThrough date
    // if we'd want to soft-delete the container as well
    // we'd likely have to use RS_DELETED_FOLDER from utils/constants
    const publishedTemplate = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: this.documentContainer.id,
          },
        },
      })
    )[0];

    if (publishedTemplate) {
      const currentTemplateVersion = await publishedTemplate.currentVersion;
      if (currentTemplateVersion) {
        currentTemplateVersion.validThrough = new Date();
        await currentTemplateVersion.save();
      }
    }

    this.removeTemplateModalIsOpen = false;
    await this.documentContainer.deleteRecord();
    await this.documentContainer.save();
    this.refresh();
  });

  @action
  logout() {
    this.session.invalidate();
  }

  updateSearchFilterTask = restartableTask(
    async (queryParamProperty, event) => {
      await timeout(300);

      this[queryParamProperty] = event.target.value.trim();
      this.resetPagination();
    },
  );

  resetPagination() {
    this.page = 0;
  }

  @action
  handleTitleUpdate(event) {
    this.editorDocument.title = event.target.value;
  }
}
