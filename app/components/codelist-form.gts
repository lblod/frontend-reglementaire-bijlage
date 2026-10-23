import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import CodelistValidations from '../validations/codelist';
import OptionValidations from '../validations/codelist-option';
import { tracked } from '@glimmer/tracking';
import changesetList from '../utils/changeset';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import { isBlank } from '../utils/strings';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type IntlService from 'ember-intl/services/intl';
import type { BufferedChangeset } from 'ember-changeset/types';

import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';

import sortableGroup from 'ember-sortable/modifiers/sortable-group';
import sortableItem from 'ember-sortable/modifiers/sortable-item';
import sortableHandle from 'ember-sortable/modifiers/sortable-handle';

import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { not, or } from 'ember-truth-helpers';

// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import ConfirmRouteLeave from './confirm-route-leave';
import type CodeListModel from 'frontend-reglementaire-bijlage/models/code-list';

const MAX_CODELIST_OPTIONS = 20;

type Arguments = {
  codelist: CodeListModel;
};

export default class CodelistFormComponent extends Component<Arguments> {
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare intl: IntlService;

  @tracked changeset: BufferedChangeset | null = null;
  @tracked optionsChangesetList;

  @tracked isEditingOptions = false;

  @action
  async didInsert() {
    const concepts = (await this.args.codelist.concepts).slice();
    const conceptsSorted = concepts.sort((a, b) => {
      if (!a.position && !b.position) {
        return 0;
      }
      if (!a.position) {
        return -1;
      }
      if (!b.position) {
        return 1;
      }
      if (a.position === b.position) return 0;
      return a.position > b.position ? 1 : -1;
    });

    this.optionsChangesetList = new changesetList(
      conceptsSorted,
      OptionValidations,
      ['inScheme', this.args.codelist],
    );

    this.changeset = Changeset(
      this.args.codelist,
      lookupValidator(CodelistValidations),
      CodelistValidations,
    );

    if (this.args.codelist.isNew) {
      this.startEditingOptions();
    }
  }

  get isSaving() {
    return this.saveChangesetTask.isRunning;
  }

  get allPristine() {
    return this.optionsChangesetList?.isPristine && this.changeset?.isPristine;
  }

  get allValid() {
    return this.optionsChangesetList?.isValid && this.changeset?.isValid;
  }

  get canAddOption() {
    return this.optionsChangesetList?.changesets.length < MAX_CODELIST_OPTIONS;
  }

  @action
  startEditingOptions() {
    this.isEditingOptions = true;
  }
  @action
  addOption() {
    if (!this.canAddOption) return;

    this.optionsChangesetList.new(
      this.store.createRecord('skosConcept', {
        createdOn: new Date(),
        position: this.optionsChangesetList.length,
      }),
    );
  }

  @action
  removeOption(option) {
    this.optionsChangesetList.remove(option);
  }

  @action
  setCodelistLabel(event: Event) {
    this.changeset['label'] = (event.target as HTMLInputElement).value;
  }

  @action
  setOptionValue(option, event: Event) {
    option.value = event.target.value;
  }

  @action
  setOptionLabel(option, event: Event) {
    option.label = event.target.value;
    // auto-validate the uniqueness of labels,
    // just like ember-changeset does for other validation
    this.validateUniqueLabels.perform();
  }

  validateUniqueLabels = dropTask(async () => {
    const uniqueValues = new Set();
    this.optionsChangesetList.changesets.forEach((option) => {
      let label = option.label;
      //workaround to clear a custom error
      option.label = label;

      if (uniqueValues.has(label)) {
        option.addError(
          'label',
          this.intl.t('codelist.options.label-unique-error'),
        );
      } else {
        if (label !== undefined && !isBlank(label)) {
          uniqueValues.add(label);
        }
      }
    });
  });

  saveChangesetTask = dropTask(async (event: Event) => {
    event.preventDefault();

    await this.changeset.validate();
    await this.optionsChangesetList.validate();

    // remove empty labels to avoid confusing empty or space-only labels in database
    this.optionsChangesetList.changesets.forEach((changeset) => {
      if (isBlank(changeset.label)) {
        changeset.label = null;
      }
    });

    await this.validateUniqueLabels.perform();

    if (
      this.allValid &&
      this.optionsChangesetList.length <= MAX_CODELIST_OPTIONS
    ) {
      let wasNew = this.args.codelist.isNew;
      const administrativeUnit = await this.store.findRecord(
        'administrative-unit',
        this.currentSession.group.id,
      );
      this.changeset.publisher = administrativeUnit;
      await this.changeset.save();
      await this.optionsChangesetList.save();
      this.isEditingOptions = false;
      if (wasNew) {
        this.router.transitionTo('codelist-management.edit', this.changeset.id);
      }
    }
  });

  @action
  cancelEditingTask() {
    this.reset();
    this.router.transitionTo('codelist-management');
  }

  reset() {
    this.changeset?.rollback();
    this.args.codelist.rollbackAttributes();
    this.optionsChangesetList.rollback();
  }

  @action
  sortEndAction(items) {
    const options = items;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      option.position = i;
    }
    // TODO: some shenanigans going on here cause changesetList
    // is a weird class, this is the best way I found but we might
    // want to refactor that out
    this.optionsChangesetList._changesets = items;
    // eslint-disable-next-line no-self-assign
    this.optionsChangesetList = this.optionsChangesetList;
  }

  willDestroy() {
    this.reset();
    super.willDestroy();
  }

  <template>
    <AuToolbar @border='bottom' @size='large' as |Group|>
      <Group>
        <AuHeading @skin='2'>
          {{#if @codelist.isNew}}
            {{t 'codelist.crud.new'}}
          {{else}}
            {{t 'codelist.crud.edit'}}
          {{/if}}
        </AuHeading>
      </Group>
      <AuButtonGroup>
        <AuButton
          @disabled={{or this.allPristine (not this.allValid)}}
          @loading={{this.isSaving}}
          @loadingMessage={{t 'utility.saving'}}
          {{on 'click' this.saveChangesetTask.perform}}
        >
          {{t 'utility.save'}}
        </AuButton>
        <AuButton @skin='secondary' {{on 'click' this.cancelEditingTask}}>
          {{t 'utility.cancel'}}
        </AuButton>
      </AuButtonGroup>
    </AuToolbar>

    <div
      class='au-c-body-container au-c-body-container--scroll au-o-flow--large'
      {{didInsert this.didInsert}}
    >
      <div class='au-u-1-2@small au-u-1-1'>
        {{#let this.changeset.error.label as |isInvalid|}}
          <p class='au-o-box au-u-padding-bottom-none'>
            <AuLabel @error={{isInvalid}} for='codelist-name-input'>
              {{t 'codelist.attr.label'}}&nbsp;
              <AuPill>
                {{t 'utility.required'}}
              </AuPill>
            </AuLabel>
            <AuInput
              @error={{isInvalid}}
              @width='block'
              id='codelist-name-input'
              required='required'
              placeholder={{t 'utility.type-something-placeholder'}}
              value={{this.changeset.label}}
              {{on 'input' this.setCodelistLabel}}
            />
            {{#if isInvalid}}
              <AuHelpText>
                {{t 'utility.field-required'}}
              </AuHelpText>
            {{/if}}
          </p>
        {{/let}}
      </div>
      <div>
        <table class='au-c-data-table__table'>
          <thead>
            <tr class='au-c-data-table__header'>
              <th class='data-table__header-title'></th>
              <th class='data-table__header-title'>
                <p>
                  {{t 'codelist.options.label'}}
                </p>
                <p class='au-u-muted au-u-light'>
                  {{t 'codelist.options.label-explanation'}}
                </p>
              </th>
              {{#if this.isEditingOptions}}
                <th class='data-table__header-title'>
                  <p>{{t 'codelist.options.value'}}
                    <AuPill>
                      {{t 'utility.required'}}
                    </AuPill>
                  </p>
                </th>
                <th></th>
              {{else}}
                <th class='data-table__header-title'>
                  <AuToolbar as |Group|>
                    <Group>{{t 'codelist.options.value'}}</Group>
                    <Group><AuButton
                        class=''
                        {{on 'click' this.startEditingOptions}}
                      >{{t 'codelist.crud.edit-table'}}
                      </AuButton></Group>
                  </AuToolbar>
                </th>
              {{/if}}
            </tr>
          </thead>
          <tbody {{sortableGroup onChange=this.sortEndAction}}>
            {{#each this.optionsChangesetList.changesets as |option|}}
              <tr {{sortableItem distance=0 model=option}}>
                <td class='drag-icon-cell' tabindex='-1' {{sortableHandle}}>
                  <AuIcon
                    @icon='drag'
                    size='large'
                    class='au-c-button--drag handle'
                  />
                </td>
                {{#if this.isEditingOptions}}
                  <td>
                    {{#let option.error.label as |labelError|}}
                      <AuInput
                        @error={{labelError}}
                        value={{option.label}}
                        {{on 'input' (fn this.setOptionLabel option)}}
                      />
                      {{#if labelError}}
                        <AuHelpText>
                          {{labelError.validation}}
                        </AuHelpText>
                      {{/if}}
                    {{/let}}
                  </td>
                  <td>
                    {{#let option.error.value as |isInvalid|}}
                      <AuInput
                        @error={{isInvalid}}
                        value={{option.value}}
                        @isError={{option.isInvalid}}
                        placeholder={{t 'utility.type-something-placeholder'}}
                        {{on 'change' (fn this.setOptionValue option)}}
                      />
                      {{#if isInvalid}}
                        <AuHelpText>
                          {{t 'utility.field-required'}}
                        </AuHelpText>
                      {{/if}}
                    {{/let}}
                  </td>
                  <td>
                    <AuButton
                      @icon='trash'
                      @alert={{true}}
                      @skin='naked'
                      {{on 'click' (fn this.removeOption option)}}
                    >
                      {{t 'utility.delete'}}
                    </AuButton>
                  </td>
                {{else}}
                  <td>{{option.label}}</td>
                  <td>{{option.value}}</td>
                {{/if}}
              </tr>
            {{/each}}
          </tbody>
          <tfoot>
            {{#if this.isEditingOptions}}
              <th class='au-u-padding-right-small' colspan='4'>
                <AuButton
                  @width='block'
                  @icon='plus'
                  @skin='secondary'
                  @disabled={{not this.canAddOption}}
                  title={{unless
                    this.canAddOption
                    (t 'codelist.crud.max-options-hit')
                  }}
                  {{on 'click' this.addOption}}
                >
                  {{t 'codelist.crud.add-option'}}
                </AuButton>
              </th>
            {{/if}}
          </tfoot>
        </table>
      </div>
    </div>

    <ConfirmRouteLeave @enabled={{not this.allPristine}} />
  </template>
}
