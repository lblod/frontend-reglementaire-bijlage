import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { localCopy } from 'tracked-toolbox';
import isAfter from 'date-fns/isAfter';
import { isBlank } from '../../utils/strings';
import { getTemplateType, getTemplateTypes } from '../../utils/template-type';

export default class TemplateManagementIndexController extends Controller {
  @service store;
  @service session;
  @service router;
  @service currentSession;
  @service muTask;
  @service intl;

  // queryParams
  queryParams = ['title', 'page', 'size', 'sort'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked title = '';
  sort = '-current-version.created-on';

  @localCopy('title', '') searchQuery;

  @tracked editorDocument;
  @tracked documentContainer;
  @tracked templateTypeToCreate = this.templateTypes[0];
  @tracked createTemplateModalIsOpen;
  @tracked removeTemplateModalIsOpen;
  @tracked selectedTemplates = tracked(Set);
  @tracked lastCheckedTemplate;

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
      let validThrough =
        templateVersion.validThrough && new Date(templateVersion.validThrough);
      if (validThrough && isAfter(validThrough, Date.now())) {
        // Only display as unpublished when it actually is
        validThrough = undefined;
      }
      return { created: templateVersion.created, validThrough };
    } else {
      return;
    }
  };

  @action
  startCreateTemplateFlow() {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document', {
      title: '',
      content: '',
      createdOn: new Date(),
      updatedOn: new Date(),
    });
    this.editorDocument = editorDocument;
    this.documentContainer = documentContainer;

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

    this.documentContainer.folder = await this.store.findRecord(
      'editor-document-folder',
      this.templateTypeToCreate.folder,
    );
    this.documentContainer.currentVersion = this.editorDocument;
    await this.documentContainer.save();

    this.editorDocument.documentContainer = this.documentContainer;
    await this.editorDocument.save();

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
  closeRemoveTemplateModal() {
    this.removeTemplateModalIsOpen = false;
  }

  @action
  cancelRemoveTemplate() {
    this.editorDocument = undefined;
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

    await this.documentContainer.deleteRecord();
    await this.documentContainer.save();
    this.refresh();
  });

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  updateSearchQuery(event) {
    event.preventDefault();
    this.searchQuery = event.target.value;
  }

  @action
  search(event) {
    event.preventDefault();
    this.title = this.searchQuery;
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }

  @action
  handleTitleUpdate(event) {
    this.editorDocument.title = event.target.value;
  }

  isSelected = (uri) => {
    return this.selectedTemplates.has(uri);
  };

  @action
  onTemplateSelectionChange(event) {
    const value = event.target.value;
    if (event.target.checked) {
      if (event.shiftKey && this.lastCheckedTemplate) {
        const documentContainers = [...this.model];
        const index1 = documentContainers.findIndex(
          (container) => container.uri === this.lastCheckedTemplate,
        );
        const index2 = documentContainers.findIndex((container) => {
          return container.uri === value;
        });
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);
        for (let i = startIndex; i <= endIndex; i++) {
          const container = documentContainers[i];
          this.selectedTemplates.add(container.uri);
        }
      } else {
        this.selectedTemplates.add(value);
      }
      this.lastCheckedTemplate = value;
    } else {
      this.selectedTemplates.delete(value);
    }
  }

  get selectAllChecked() {
    return this.selectedTemplates.size > 0;
  }

  @action
  onSelectAllChange() {
    if (event.target.checked) {
      const documentContainers = [...this.model];
      this.selectedTemplates = tracked(
        new Set(documentContainers.map((container) => container.uri)),
      );
    } else {
      this.selectedTemplates = tracked(new Set());
    }
  }
}
