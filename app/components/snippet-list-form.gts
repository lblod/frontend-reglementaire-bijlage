import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '../utils/strings';
import { saveCollatedImportedResources } from '../utils/imported-resources';
import { trackedFunction } from 'reactiveweb/function';
import { localCopy } from 'tracked-toolbox';
import Store from 'frontend-reglementaire-bijlage/services/store';
import type Router from 'frontend-reglementaire-bijlage/router';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import Snippet from 'frontend-reglementaire-bijlage/models/snippet';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import t from 'ember-intl/helpers/t';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { on } from '@ember/modifier';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuTextarea from '@appuniversum/ember-appuniversum/components/au-textarea';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { array, fn } from '@ember/helper';
import detailedDate from 'frontend-reglementaire-bijlage/helpers/detailed-date';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import { or } from 'ember-truth-helpers';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import sortableItem from 'ember-sortable/modifiers/sortable-item';
import sortableGroup from 'ember-sortable/modifiers/sortable-group';
import sortableHandle from 'ember-sortable/modifiers/sortable-handle';
import SnippetVersionModel from 'frontend-reglementaire-bijlage/models/snippet-version';
import TagSelector from 'frontend-reglementaire-bijlage/components/tag-selector';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { setTags } from 'frontend-reglementaire-bijlage/api/document-container';

const SHOW_SAVED_PILL = 'showSavedPill';

type Arguments = {
  snippetList: SnippetList;
};

export default class SnippetListForm extends Component<Arguments> {
  @service declare store: Store;
  @service declare router: Router;
  @service declare currentSession: CurrentSessionService;

  @tracked label = '';
  @tracked isRemoveModalOpen = false;
  @tracked deletingSnippet: Snippet | null = null;

  @localCopy('snippetsRequest.value') snippets: Snippet[] = [];

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
  async reorderSnippets(newSnippets: Snippet[]) {
    this.snippets = newSnippets;
    const promises = [];
    for (let i = 0; i < this.snippets.length; i++) {
      const snippet = this.snippets[i];
      if (!snippet) continue;
      if (i !== snippet.position) {
        snippet.position = i;
        promises.push(snippet.save());
      }
    }
    await Promise.all(promises);
  }

  updateLabel = restartableTask(async (event: Event) => {
    await this.showSavedTask.cancelAll();
    const value = (event.target as HTMLInputElement).value;
    this.snippetList.label = value;
    if (this.invalidLabel) {
      return;
    }
    const isNew = this.snippetList.isNew;
    await timeout(1000);
    await this.snippetList.save();
    await this.showSavedTask.perform();
    if (isNew) {
      this.router.replaceWith('snippet-management.edit', this.snippetList, {
        queryParams: { [SHOW_SAVED_PILL]: true },
      });
    }
  });

  constructor() {
    super(...arguments);
    const queryParams = this.router.currentRoute?.queryParams;

    if (queryParams?.[SHOW_SAVED_PILL]) {
      void this.showSavedTask.perform().then(() => {
        // Remove the query param from the URL, so that refreshing the page
        // doesn't show the saved message again.
        // Use `replaceWith` instead of `transitionTo` to avoid adding a new
        // history entry.
        this.router.replaceWith('snippet-management.edit', this.snippetList, {
          queryParams: { [SHOW_SAVED_PILL]: undefined },
        });
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

    const snippetVersion = this.store.createRecord<SnippetVersionModel>(
      'snippet-version',
      {
        title: `Snippet created on ${new Date().toDateString()}`,
        createdOn: now,
        content: '',
      },
    );
    await snippetVersion.save();

    const snippet = this.store.createRecord<Snippet>('snippet', {
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
  openRemoveModal(snippet: Snippet) {
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

  changeTags = async (tags: Tag[]) => {
    await setTags(this.args.snippetList, tags);
  };

  <template>
    <div class='au-c-form au-u-margin-bottom'>
      <AuFormRow>
        <AuLabel for='label'>
          {{t 'snippets.edit-snippet-list.form.label.label'}}
        </AuLabel>
        <p class='under-label-text'>
          {{t 'snippets.edit-snippet-list.form.label.description'}}
        </p>
        <div class='au-u-flex au-u-flex--vertical-center'>
          <AuInput
            @error={{this.invalidLabel}}
            id='label'
            required='required'
            value={{@snippetList.label}}
            {{on 'input' this.updateLabel.perform}}
          />
          {{#if this.showSavedTask.isRunning}}
            <div class='snippets-pill-container'>
              <AuPill @skin='success' @icon='check'>
                {{t 'utility.saved'}}
              </AuPill>
            </div>
          {{/if}}
        </div>
      </AuFormRow>
      <AuFormRow>
        <AuLabel for='tags'>
          {{t 'template-management.tags.label'}}
        </AuLabel>
        <div class='au-u-flex au-u-flex--vertical-center'>
          <TagSelector
            @onChange={{this.changeTags}}
            @selectedTags={{@snippetList.tags}}
            @allowCreate={{true}}
          />
        </div>
      </AuFormRow>
      <AuFormRow>
        <AuLabel for='imported-resources'>
          {{t 'snippets.edit-snippet-list.imported-resources.heading'}}
        </AuLabel>
        <AuTextarea
          id='imported-resources'
          class='au-u-1-1'
          @disabled={{true}}
          value={{this.importedResources}}
        />
      </AuFormRow>
    </div>
    <div class='snippets-table'>
      <table class='au-c-data-table__table'>
        <thead>
          <tr class='au-c-data-table__header'>
            <th></th>
            <th>{{t 'snippets.edit-snippet-list.table.columns.snippet'}}</th>
            <th>{{t 'template-management.created-on'}}</th>
            <th>{{t 'template-management.updated-on'}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody {{sortableGroup onChange=this.reorderSnippets}}>
          {{#if this.snippetsRequest.isLoading}}
            <tr><td colspan='100%'>{{t 'utility.loading'}}</td></tr>
          {{else if this.snippetsRequest.isError}}
            <tr>
              <td colspan='100%'>
                <AuAlert
                  @icon='alert-triangle'
                  @skin='info'
                  @size='small'
                  @closable={{false}}
                  @title={{t 'snippets.edit-snippet-list.table.loading-error'}}
                >
                  <AuButton
                    @skin='link'
                    {{on 'click' this.snippetsRequest.retry}}
                    class='au-u-padding-none'
                  >
                    {{t 'utility.retry'}}
                  </AuButton>
                </AuAlert>

              </td>
            </tr>
          {{else}}
            {{#each this.snippets as |snippet|}}
              <tr {{sortableItem distance=0 model=snippet}}>
                <td class='drag-icon-cell' tabindex='-1' {{sortableHandle}}>
                  <AuIcon @icon='drag' size='large' class='au-c-button--drag' />
                </td>
                <td>
                  <AuLink
                    @skin='primary'
                    @route='snippet-management.edit.edit-snippet'
                    @models={{array @snippetList.id snippet.id}}
                  >
                    {{snippet.currentVersion.title}}
                  </AuLink>
                </td>
                <td>
                  {{detailedDate snippet.createdOn}}
                </td>
                <td>
                  {{detailedDate snippet.updatedOn}}
                </td>
                <td>
                  <AuButton
                    @skin='naked'
                    @icon='trash'
                    @alert={{true}}
                    @disabled={{this.invalidLabel}}
                    {{on 'click' (fn this.openRemoveModal snippet)}}
                  >
                    {{t 'utility.delete'}}
                  </AuButton>
                </td>
              </tr>
            {{else}}
              <tr><td colspan='100%'>{{t
                    'snippets.edit-snippet-list.table.no-data'
                  }}</td></tr>
            {{/each}}
          {{/if}}
        </tbody>
      </table>
    </div>
    <div class='snippets-add-button-container'>
      <AuButton
        @icon='add'
        @skin='secondary'
        @width='block'
        @disabled={{or this.invalidLabel @snippetList.isNew}}
        {{on 'click' this.createSnippet.perform}}
        @loading={{this.createSnippet.isRunning}}
        @loadingMessage={{t 'utility.loading'}}
      >
        {{t 'snippets.edit-snippet-list.snippet-creation.action'}}
      </AuButton>
    </div>
    <div class='snippet-list-template-table au-u-margin-top-huge'>
      <AuHeading @skin='4' class='au-u-margin-bottom'>
        {{t 'snippets.edit-snippet-list.connected-documents.heading'}}
      </AuHeading>
      <div class='au-u-margin-bottom'>
        <AuDataTable
          @content={{this.linkedTemplates.value}}
          @isLoading={{this.linkedTemplates.isLoading}}
          @noDataMessage={{t
            'snippets.edit-snippet-list.connected-documents.templates-table.no-data'
          }}
          as |s|
        >
          <s.content as |c|>
            <c.header>
              <th>{{t
                  'snippets.edit-snippet-list.connected-documents.templates-table.columns.template'
                }}</th>
            </c.header>
            <c.body as |template|>
              <td>
                <AuLink
                  @skin='primary'
                  @route='template-management.edit'
                  @model={{template.id}}
                >
                  {{template.currentVersion.title}}
                </AuLink>
              </td>
            </c.body>
          </s.content>
        </AuDataTable>
      </div>
      <div class='au-u-margin-bottom'>
        <AuDataTable
          @content={{this.linkedSnippets.value}}
          @isLoading={{this.linkedSnippets.isLoading}}
          @noDataMessage={{t
            'snippets.edit-snippet-list.connected-documents.snippets-table.no-data'
          }}
          as |s|
        >
          <s.content as |c|>
            <c.header>
              <th>
                {{t
                  'snippets.edit-snippet-list.connected-documents.snippets-table.columns.snippet'
                }}
              </th>
            </c.header>
            <c.body as |snippet|>
              <td>
                <AuLink
                  @skin='primary'
                  @route='snippet-management.edit.edit-snippet'
                  @models={{array snippet.snippetList.id snippet.id}}
                >
                  {{snippet.currentVersion.title}}
                </AuLink>
              </td>
            </c.body>
          </s.content>
        </AuDataTable>
      </div>
    </div>
    <AuModal
      @title={{t 'utility.confirmation.body'}}
      @modalOpen={{this.isRemoveModalOpen}}
      @closeModal={{this.closeRemoveModal}}
      as |Modal|
    >
      <Modal.Body>
        <p>
          {{t
            'snippets.edit-snippet-list.snippet-deletion.confirm'
            name=this.deletingSnippet.label
            htmlSafe=true
          }}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <AuButton
          @alert={{true}}
          @loading={{this.removeSnippet.isRunning}}
          @loadingMessage={{t 'utility.deleting'}}
          {{on 'click' this.removeSnippet.perform}}
        >
          {{t 'snippets.edit-snippet-list.snippet-deletion.action.long'}}
        </AuButton>
        <AuButton @skin='secondary' {{on 'click' this.closeRemoveModal}}>
          {{t 'utility.cancel'}}
        </AuButton>
      </Modal.Footer>
    </AuModal>
  </template>
}
