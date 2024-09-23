import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '../utils/strings';
import { saveCollatedImportedResources } from '../utils/imported-resources';
import { trackedFunction } from 'ember-resources/util/function';

const SHOW_SAVED_PILL = 'showSavedPill';

export default class SnippetListForm extends Component {
  @service store;
  @service router;
  @service currentSession;

  @tracked label = '';
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippet;

  snippets = trackedFunction(this, async () => {
    const snippets = await this.args.model.snippets;
    const snippetsWithCreationDate = await Promise.all(
      snippets.slice().map(async (snippet) => {
        const currentVersion = await snippet.currentVersion;
        return {
          snippet,
          createdOn: currentVersion.createdOn,
        };
      }),
    );
    // Sorted snippets in descending order
    const sortedSnippets = snippetsWithCreationDate.sort((a, b) => {
      return a.createdOn > b.createdOn ? -1 : 1;
    });
    return sortedSnippets.map(
      (snippetWithCreationDate) => snippetWithCreationDate.snippet,
    );
  });

  updateLabel = restartableTask(async (event) => {
    this.showSavedTask.cancelAll();
    const value = event.target.value;
    this.args.model.label = value;
    if (this.invalidLabel) {
      return;
    }
    const isNew = this.args.model.isNew;
    await timeout(1000);
    await this.args.model.save();
    this.showSavedTask.perform();
    if (isNew) {
      this.router.replaceWith('snippet-management.edit', this.args.model, {
        queryParams: { [SHOW_SAVED_PILL]: true },
      });
    }
  });

  constructor() {
    super(...arguments);
    const queryParams = this.router.currentRoute.queryParams;

    if (queryParams[SHOW_SAVED_PILL]) {
      this.showSavedTask.perform();

      // Remove the query param from the URL, so that refreshing the page
      // doesn't show the saved message again.
      // Use `replaceWith` instead of `transitionTo` to avoid adding a new
      // history entry.
      this.router.replaceWith('snippet-management.edit', this.args.model, {
        queryParams: { [SHOW_SAVED_PILL]: undefined },
      });
    }
  }

  get invalidLabel() {
    return isBlank(this.args.model.label);
  }

  get importedResources() {
    return this.args.model.importedResources?.join(', ');
  }

  showSavedTask = restartableTask(async () => {
    await timeout(3000);
  });

  createSnippet = task(async () => {
    const documentContainer = this.store.createRecord('document-container');
    const editorDocument = this.store.createRecord('editor-document');
    editorDocument.content = '';
    editorDocument.createdOn = new Date();
    editorDocument.updatedOn = new Date();
    editorDocument.title = `Snippet created on ${new Date().toDateString()}`;
    documentContainer.currentVersion = editorDocument;
    await this.args.model.snippets;
    this.args.model.snippets.pushObject(documentContainer);
    await editorDocument.save();
    await documentContainer.save();
    await this.args.model.save();

    this.router.transitionTo('snippet-management.edit.edit-snippet', {
      documentContainer,
      snippetList: this.args.model,
    });
  });

  updateImportedResourcesOnList = task(async () => {
    return saveCollatedImportedResources(await this.args.model);
  });

  removeSnippet = task(async () => {
    this.args.model.snippets.removeObject(this.deletingSnippet);

    const editorDocument = await this.deletingSnippet.currentVersion;

    const publishedSnippetVersion =
      await editorDocument.publishedSnippetVersion;

    if (publishedSnippetVersion) {
      publishedSnippetVersion.validThrough = new Date();
      await publishedSnippetVersion.save();
    }

    await this.deletingSnippet.deleteRecord();

    await this.args.model.save();
    await Promise.all([
      this.deletingSnippet.save(),
      this.updateImportedResourcesOnList.perform(),
    ]);
    this.closeRemoveModal();
  });

  @action
  openRemoveModal(snippet) {
    this.deletingSnippet = snippet;
    this.isRemoveModalOpen = true;
  }

  @action
  closeRemoveModal() {
    this.deletingSnippet = null;
    this.isRemoveModalOpen = false;
  }
  @action
  goBack() {
    history.back();
  }
}
