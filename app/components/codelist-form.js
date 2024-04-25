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

const MAX_CODELIST_OPTIONS = 20;
export default class CodelistFormComponent extends Component {
  @service router;
  @service store;
  @service currentSession;
  @service intl;

  @tracked changeset;
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
  setCodelistLabel(event) {
    this.changeset.label = event.target.value;
  }

  @action
  setOptionValue(option, event) {
    option.value = event.target.value;
  }

  @action
  setOptionLabel(option, event) {
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

  saveChangesetTask = dropTask(async (event) => {
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
    this.changeset.rollback();
    this.args.codelist.rollbackAttributes();
    this.optionsChangesetList.rollback();
  }

  @action
  sortEndAction() {
    const options = this.optionsChangesetList.changesets;
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      option.position = i;
    }
  }

  willDestroy(...args) {
    this.reset();
    super.willDestroy(...args);
  }
}
