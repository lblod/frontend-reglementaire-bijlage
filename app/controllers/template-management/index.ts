import Controller from '@ember/controller';
import { all, restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked, TrackedSet } from 'tracked-built-ins';
import { isBlank } from '../../utils/strings';
import {
  getTemplateType,
  getTemplateTypes,
  type TemplateType,
} from '../../utils/template-type';
import { PublicationStatus } from 'frontend-reglementaire-bijlage/components/publication-status';
import { getValidity } from 'frontend-reglementaire-bijlage/api/template';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type SessionService from 'frontend-reglementaire-bijlage/services/session';
import type RouterService from '@ember/routing/router-service';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type MuTaskService from 'frontend-reglementaire-bijlage/services/mu-task';
import type IntlService from 'ember-intl/services/intl';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';
import DocumentContainerModel from 'frontend-reglementaire-bijlage/models/document-container';
import EditorDocumentModel from 'frontend-reglementaire-bijlage/models/editor-document';
import Tag from 'frontend-reglementaire-bijlage/models/tag';
import Template from 'frontend-reglementaire-bijlage/models/template';
import EditorDocumentFolderModel from 'frontend-reglementaire-bijlage/models/editor-document-folder';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import type TemplateManagementIndexRoute from 'frontend-reglementaire-bijlage/routes/template-management/index';

const TITLE_SEARCH_DEBOUNCE_TIME = 300;

export default class TemplateManagementIndexController extends Controller {
  declare model: ModelFrom<TemplateManagementIndexRoute>;
  PublicationStatus = PublicationStatus;
  @service declare store: Store;
  @service declare session: SessionService;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;
  @service declare muTask: MuTaskService;
  @service declare intl: IntlService;
  @service declare tagManager: TagManager;

  // queryParams
  queryParams = ['title', 'page', 'size', 'sort', 'templateTags'];
  @tracked page = 0;
  @tracked size = 20;
  @tracked title = '';
  sort = '-current-version.created-on';
  // @ts-expect-error The service is initialized by ember
  allTemplateTypes = getTemplateTypes(this.intl);
  folder: TemplateType | null = null;
  refresh: (() => unknown) | null = null;

  @tracked editorDocument: EditorDocumentModel | null = null;
  @tracked documentContainer: DocumentContainerModel | null = null;
  @tracked templateTypeToCreate = this.allTemplateTypes[0] ?? null;
  @tracked tagsToCreate: Tag[] = [];
  @tracked selectedTemplates: TrackedSet<string> = tracked(Set);
  @tracked lastCheckedTemplateUri: string | null = null;

  @tracked templateTypes: TemplateType[] = [];
  @tracked templateTags: string[] = [];
  @tracked isReadMode = true;

  @tracked createTemplateModalIsOpen = false;
  @tracked removeTemplateModalIsOpen = false;
  @tracked bulkEditModalIsOpen = false;

  changeFilterTemplateTypes = (newTemplateTypes: TemplateType[]) => {
    this.templateTypes = newTemplateTypes;
    this.resetPagination();
  };

  changeFilterTemplateTags = (newTemplateTags: Tag[]) => {
    // The tags will always already have an id since we don't allow creation in the filter
    this.templateTags = newTemplateTags.map(
      (templateTag) => templateTag.id,
    ) as string[];
    this.resetPagination();
  };

  enableEditMode = () => {
    this.isReadMode = false;
  };

  enableReadMode = () => {
    this.isReadMode = true;
  };

  changeTagsFor = async (
    documentContainer: DocumentContainerModel,
    tags: Tag[],
  ) => {
    await this.tagManager.setTags(documentContainer, tags);
  };

  resetFilters = () => {
    this.templateTags = [];
    this.templateTypes = [];
    this.title = '';
    this.resetPagination();
  };

  updateTemplateType = (templateType: TemplateType) => {
    this.templateTypeToCreate = templateType;
  };

  updateTemplateTags = (newTags: Tag[]) => {
    this.tagsToCreate = newTags;
  };

  showBulkEditModal = () => {
    this.bulkEditModalIsOpen = true;
  };

  getTemplateTypeLabel = async (documentContainer: DocumentContainerModel) => {
    const type = await documentContainer.templateTypeId;
    return getTemplateType(type, this.intl)?.label;
  };

  publishedTemplate = async (documentContainer: DocumentContainerModel) => {
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
      await this.store.query<Template>('template', {
        filter: {
          'derived-from': {
            id: documentContainer.id,
          },
        },
        // the abovementioned bogus query param
        avoid_cache: new Date().toISOString(),
        // as mentioned above, without this we still get stale data
        include: ['currentVersion'],
      })
    )[0];
    if (publishedTemplate) {
      return getValidity(publishedTemplate);
    } else {
      return;
    }
  };

  startCreateTemplateFlow = () => {
    const documentContainer = this.store.createRecord<DocumentContainerModel>(
      'document-container',
      {},
    );
    const editorDocument = this.store.createRecord<EditorDocumentModel>(
      'editor-document',
      {
        title: '',
        content: '',
        createdOn: new Date(),
        updatedOn: new Date(),
      },
    );
    this.editorDocument = editorDocument;
    this.documentContainer = documentContainer;

    this.createTemplateModalIsOpen = true;
  };

  cancelCreateTemplate = () => {
    this.editorDocument = null;
    this.documentContainer = null;
    this.folder = this.allTemplateTypes[0] ?? null;
    this.createTemplateModalIsOpen = false;
    this.tagsToCreate = [];
  };

  get isInvalidTemplateTitle() {
    return isBlank(this.editorDocument?.title);
  }

  saveTemplate = task(async (event: Event) => {
    event.preventDefault();

    if (
      !this.editorDocument ||
      !this.documentContainer ||
      !this.templateTypeToCreate?.folder
    )
      return;

    // Store all new tags
    await this.tagManager.saveTags(this.tagsToCreate);

    await this.editorDocument.save();

    this.documentContainer.set(
      'folder',
      await this.store.findRecord<EditorDocumentFolderModel>(
        'editor-document-folder',
        this.templateTypeToCreate.folder,
      ),
    );

    this.documentContainer.set('currentVersion', this.editorDocument);

    this.documentContainer.set('tags', this.tagsToCreate);
    await this.documentContainer.save();

    this.editorDocument.set('documentContainer', this.documentContainer);
    await this.editorDocument.save();

    this.createTemplateModalIsOpen = false;
    this.router.transitionTo(
      'template-management.edit',
      this.documentContainer.id,
    );
  });

  startRemoveTemplateFlow = (documentContainer: DocumentContainerModel) => {
    this.removeTemplateModalIsOpen = true;
    this.documentContainer = documentContainer;
  };

  closeRemoveTemplateModal = () => {
    this.removeTemplateModalIsOpen = false;
  };

  cancelRemoveTemplate = () => {
    this.editorDocument = null;
  };

  closeBulkEditModal = () => {
    this.bulkEditModalIsOpen = false;
  };

  saveBulkEdit = task(
    async ({ add, remove }: { add: Tag[]; remove: Tag[] }) => {
      await this.tagManager.saveTags(add);
      await all(
        [...this.selectedTemplates.values()].map(async (template: string) => {
          const documentContainer = this.model.documentContainer.find(
            (documentContainer) => documentContainer.uri === template,
          );
          if (!documentContainer) return;
          const tags = await documentContainer.tags;
          const removed = tags.filter(
            (tag: Tag) => !remove.find((tag2) => tag.id === tag2.id),
          );
          const newTags = [...removed, ...add];
          await this.tagManager.setTags(documentContainer, newTags);
        }),
      );
      this.closeBulkEditModal();
    },
  );

  submitRemoveTemplate = task(async () => {
    if (!this.documentContainer) return;
    // this is currenlty a hard-delete of the container, but a soft-delete of the
    // publishedVersion, since GN filters on the validThrough date
    // if we'd want to soft-delete the container as well
    // we'd likely have to use RS_DELETED_FOLDER from utils/constants
    const publishedTemplate = (
      await this.store.query<Template>('template', {
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

    await this.documentContainer.destroyRecord();
    this.refresh?.();
  });

  logout = () => {
    this.session.invalidate();
  };

  changeFilterTitle = restartableTask(async (newTitle: string) => {
    await timeout(TITLE_SEARCH_DEBOUNCE_TIME);

    this.title = newTitle;
    this.resetPagination();
  });

  resetPagination() {
    this.page = 0;
  }

  reset() {
    this.resetPagination();
    this.resetFilters();
    this.isReadMode = true;
  }

  handleTitleUpdate = (event: InputEvent) => {
    if (!this.editorDocument) return;
    this.editorDocument.title = (event.target as HTMLInputElement).value;
  };

  isSelected = (uri: string) => {
    return this.selectedTemplates.has(uri);
  };

  onTemplateSelectionChange = (event: MouseEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (target.checked) {
      if (event.shiftKey && this.lastCheckedTemplateUri) {
        const documentContainers = [...this.model.documentContainer];
        const index1 = documentContainers.findIndex(
          (container) => container.uri === this.lastCheckedTemplateUri,
        );
        const index2 = documentContainers.findIndex((container) => {
          return container.uri === value;
        });
        const startIndex = Math.min(index1, index2);
        const endIndex = Math.max(index1, index2);
        for (let i = startIndex; i <= endIndex; i++) {
          const container = documentContainers[i];
          if (!container?.uri) continue;
          this.selectedTemplates.add(container.uri);
        }
      } else {
        this.selectedTemplates.add(value);
      }
      this.lastCheckedTemplateUri = value;
    } else {
      this.selectedTemplates.delete(value);
    }
  };

  get selectAllChecked() {
    return this.selectedTemplates.size > 0;
  }

  onSelectAllChange = (event: Event) => {
    if ((event.target as HTMLInputElement).checked) {
      const documentContainers = [...this.model.documentContainer];
      const containerUris = documentContainers.flatMap(
        (container) => container.uri ?? [],
      );
      this.selectedTemplates = tracked(new Set(containerUris));
    } else {
      this.selectedTemplates = tracked(new Set<string>());
    }
  };
}
