import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '../utils/strings';
import { saveCollatedImportedResources } from '../utils/imported-resources';
import { trackedFunction } from 'reactiveweb/function';
import { localCopy } from 'tracked-toolbox';

const SHOW_SAVED_PILL = 'showSavedPill';

export default class SnippetListForm extends Component {
  @service store;
  @service router;
  @service currentSession;

  @tracked label = '';
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippet;

  @localCopy('snippetsRequest.value') snippets;

  get snippetList() {
    return this.args.snippetList;
  }

  snippetsRequest = trackedFunction(this, async () => {
    const snippets = await this.store.countAndFetchAll('snippet', {
      include: ['current-version'].join(','),
      filter: {
        'snippet-list': {
          ':id:': this.snippetList.id,
        },
      },
      sort: 'position,-created-on',
      fields: {
        'snippet-versions': ['title'].join(','),
      },
    });
    return snippets.slice();
  });

  linkedTemplates = trackedFunction(this, async () => {
    return this.store.countAndFetchAll('document-container', {
      include: ['current-version'].join(','),
      filter: {
        'linked-snippet-lists': {
          ':id:': this.snippetList.id,
        },
      },
      fields: {
        'editor-documents': ['title'].join(','),
      },
      sort: ':no-case:current-version.title',
    });
  });

  linkedSnippets = trackedFunction(this, async () => {
    return this.store.countAndFetchAll('snippet', {
      include: ['current-version'].join(','),
      filter: {
        'linked-snippet-lists': {
          ':id:': this.snippetList.id,
        },
      },
      fields: {
        'snippet-versions': ['title'].join(','),
      },
      sort: ':no-case:current-version.title',
    });
  });

  @action
  async reorderSnippets(newSnippets) {
    this.snippets = newSnippets;
    const promises = [];
    for (let i = 0; i < this.snippets.length; i++) {
      const snippet = this.snippets[i];
      if (i !== snippet.position) {
        snippet.position = i;
        promises.push(snippet.save());
      }
    }
    await Promise.all(promises);
  }

  updateLabel = restartableTask(async (event) => {
    this.showSavedTask.cancelAll();
    const value = event.target.value;
    this.snippetList.label = value;
    if (this.invalidLabel) {
      return;
    }
    const isNew = this.snippetList.isNew;
    await timeout(1000);
    await this.snippetList.save();
    this.showSavedTask.perform();
    if (isNew) {
      this.router.replaceWith('snippet-management.edit', this.snippetList, {
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
      this.router.replaceWith('snippet-management.edit', this.snippetList, {
        queryParams: { [SHOW_SAVED_PILL]: undefined },
      });
    }
  }

  get invalidLabel() {
    return isBlank(this.snippetList.label);
  }

  get importedResources() {
    return this.snippetList.importedResources?.join(', ');
  }

  showSavedTask = restartableTask(async () => {
    await timeout(3000);
  });

  createSnippet = task(async () => {
    const snippets = await this.snippetsRequest.promise;
    const snippetCount = snippets.length;
    const now = new Date();

    const snippetVersion = this.store.createRecord('snippet-version', {
      title: `Snippet created on ${new Date().toDateString()}`,
      createdOn: now,
      content: '',
    });
    await snippetVersion.save();

    const snippet = this.store.createRecord('snippet', {
      position: snippetCount,
      createdOn: now,
      updatedOn: now,
      snippetList: this.snippetList,
      currentVersion: snippetVersion,
    });
    await snippet.save();

    snippetVersion.snippet = snippet;
    await snippetVersion.save();

    this.snippets = [...snippets, snippet];
    this.router.transitionTo(
      'snippet-management.edit.edit-snippet',
      snippet.id,
    );
  });

  updateImportedResourcesOnList = task(async () => {
    const list = await this.store.findRecord(
      'snippet-list',
      this.snippetList.id,
      {
        reload: true,
        include: 'snippets,snippets.current-version',
      },
    );
    return saveCollatedImportedResources(list);
  });

  removeSnippet = task(async () => {
    this.snippets = this.snippets.filter(
      (snippet) => snippet !== this.deletingSnippet,
    );
    const snippetVersion = await this.deletingSnippet.currentVersion;
    if (snippetVersion) {
      snippetVersion.validThrough = new Date();
      await snippetVersion.save();
    }
    this.deletingSnippet.snippetList = null;
    await this.deletingSnippet.save();
    await this.updateImportedResourcesOnList.perform();
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
