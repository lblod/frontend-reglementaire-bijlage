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
    const publishedTemplate = (
      await this.store.query('template', {
        filter: {
          'derived-from': {
            id: documentContainer.id,
          },
        },
      })
    )[0];
    if (publishedTemplate) {
      const templateVersion = await publishedTemplate.currentVersion;
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
