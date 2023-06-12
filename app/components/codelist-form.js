import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, task } from 'ember-concurrency';
import CodelistValidations from '../validations/codelist';
import OptionValidations from '../validations/codelist-option';
import { tracked } from '@glimmer/tracking';
import {
  COD_SINGLE_SELECT_ID,
  COD_CONCEPT_SCHEME_ID,
} from '../utils/constants';

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

  @tracked codelistTypes;
  @tracked selectedType;

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
      ['inScheme', this.args.codelist]
    );

    this.changeset = Changeset(
      this.args.codelist,
      lookupValidator(CodelistValidations),
      CodelistValidations
    );

    if (this.args.codelist.isNew) {
      this.startEditingOptions();
    }

    await this.fetchCodelistTypes.perform();
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
      })
    );
  }

  @action
  removeOption(option) {
    this.optionsChangesetList.remove(option);
  }

  fetchCodelistTypes = task(async () => {
    const typesScheme = await this.store.findRecord(
      'concept-scheme',
      COD_CONCEPT_SCHEME_ID
    );
    const types = await typesScheme.concepts;
    this.codelistTypes = types;
    if (await this.args.codelist.type) {
      this.selectedType = this.args.codelist.type;
    } else {
      this.selectedType = this.codelistTypes.find(
        (type) => type.id === COD_SINGLE_SELECT_ID
      );
    }
  });

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
  }

  validateUniqueLabels() {
    const uniqueValues = new Set();
    this.optionsChangesetList.changesets.forEach((option) => {
      if (!isBlank(option.label) && uniqueValues.has(option.label)) {
        option.addError(
          'label',
          this.intl.t('codelist.options.label-unique-error')
        );
      } else {
        uniqueValues.add(option.label);
      }
    });
  }

  @action
  updateCodelistType(type) {
    this.selectedType = type;
    this.changeset.type = type;
  }

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
    this.validateUniqueLabels();

    if (
      this.allValid &&
      this.optionsChangesetList.length <= MAX_CODELIST_OPTIONS
    ) {
      let wasNew = this.args.codelist.isNew;
      const administrativeUnit = await this.store.findRecord(
        'administrative-unit',
        this.currentSession.group.id
      );
      this.changeset.publisher = administrativeUnit;
      await this.changeset.save();
      await this.optionsChangesetList.save();
      this.isEditingOptions = false;
      if (wasNew) {
        this.router.transitionTo(
          'codelists-management.edit',
          this.changeset.id
        );
      }
    }
  });

  @action
  cancelEditingTask() {
    this.reset();
    this.router.transitionTo('codelists-management');
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
