import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, task } from 'ember-concurrency';
import CodelistValidations from '../validations/codelist';
import { tracked } from '@glimmer/tracking';
import {
  COD_SINGLE_SELECT_ID,
  COD_CONCEPT_SCHEME_ID,
} from '../utils/constants';

export default class CodelistFormComponent extends Component {
  @service router;
  @service store;
  @service currentSession;

  @tracked codelistTypes;
  @tracked selectedType;

  @tracked toDelete = [];
  @tracked options = [];

  CodelistValidations = CodelistValidations;

  @action
  async didInsert() {
    const concepts = (await this.args.codelist.concepts).toArray();
    this.options = concepts.sort((a, b) => {
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
    await this.fetchCodelistTypes.perform();
  }

  get isSaving() {
    return this.editCodelistTask.isRunning;
  }

  @action
  addOption() {
    this.options.pushObject(this.store.createRecord('skosConcept'));
  }

  @action
  removeOption(option) {
    this.options.removeObject(option);
    this.toDelete.pushObject(option);
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
  setCodelistValue(codelist, attributeName, event) {
    codelist[attributeName] = event.target.value;
  }

  @action
  setOptionValue(option, event) {
    option.value = event.target.value;
  }

  @action
  setOptionLabel(option, event) {
    option.label = event.target.value;
  }

  @action
  updateCodelistType(type) {
    this.selectedType = type;
    this.args.codelist.type = type;
  }

  editCodelistTask = dropTask(async (codelist, event) => {
    event.preventDefault();

    await codelist.validate();

    if (codelist.isValid) {
      await Promise.all(this.toDelete.map((option) => option.destroyRecord()));
      const administrativeUnit = await this.store.findRecord(
        'administrative-unit',
        this.currentSession.group.id
      );
      codelist.publisher = administrativeUnit;
      codelist.concepts = this.options;
      await codelist.save();
      await Promise.all(this.options.map((option) => option.save()));
      this.router.transitionTo('codelists-management.codelist', codelist.id);
    }
  });

  @action
  cancelEditingTask() {
    for (let option of this.options) {
      option.rollbackAttributes();
    }
    this.options = [];
    for (let option of this.toDelete) {
      option.rollbackAttributes();
    }
    this.toDelete = [];

    this.router.transitionTo('codelists-management');
  }

  @action
  sortEndAction() {
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      option.position = i;
    }
  }
}
