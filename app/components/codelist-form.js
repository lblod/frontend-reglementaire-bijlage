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

  @tracked newOption;
  @tracked newModalOpen = false;

  @tracked editOption;
  @tracked editModalOpen = false;

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
  startEditOptionProcess(option) {
    this.editModalOpen = true;
    this.editOption = option;
  }

  @action
  endEditOptionProcess() {
    this.editModalOpen = false;
    this.editOption = undefined;
  }

  @action
  startNewOptionProcess() {
    this.newModalOpen = true;
    this.newOption = this.store.createRecord('skosConcept');
    this.newOption.createdOn = new Date();
    this.newOption.position = this.options.length;
  }

  @action
  submitNewOptionProcess() {
    this.options.pushObject(this.newOption);
    this.endNewOptionProcess();
  }

  @action
  endNewOptionProcess() {
    this.newModalOpen = false;
    this.newOption = undefined;
  }

  @action
  removeOption(option) {
    this.options.removeObject(option);
    this.toDelete.pushObject(option);
  }

  @task
  *fetchCodelistTypes() {
    const typesScheme = yield this.store.findRecord(
      'concept-scheme',
      COD_CONCEPT_SCHEME_ID
    );
    const types = yield typesScheme.concepts;
    this.codelistTypes = types;
    if (yield this.args.codelist.type) {
      this.selectedType = this.args.codelist.type;
    } else {
      this.selectedType = this.codelistTypes.find(
        (type) => type.id === COD_SINGLE_SELECT_ID
      );
    }
  }

  @action
  setCodelistValue(codelist, attributeName, event) {
    codelist[attributeName] = event.target.value;
  }

  @action
  updateCodelistType(type) {
    this.selectedType = type;
    this.args.codelist.type = type;
  }

  @dropTask
  *editCodelistTask(codelist, event) {
    event.preventDefault();

    yield codelist.validate();

    if (codelist.isValid) {
      yield Promise.all(this.toDelete.map((option) => option.destroyRecord()));
      const administrativeUnit = yield this.store.findRecord(
        'administrative-unit',
        this.currentSession.group.id
      );
      codelist.publisher = administrativeUnit;
      codelist.concepts = this.options;
      yield codelist.save();
      yield Promise.all(this.options.map((option) => option.save()));
      this.router.transitionTo('codelists-management.codelist', codelist.id);
    }
  }

  @action
  cancelEditingTask() {
    if (this.args.codelist.isNew) {
      this.router.transitionTo('codelists-management');
    } else {
      for (let i = 0; i < this.options.length; i++) {
        const option = this.options.objectAt(i);
        if (option.isNew) {
          option.rollbackAttributes();
          i--;
        }
      }

      for (let i = 0; i < this.toDelete.length; i++) {
        const option = this.toDelete.objectAt(i);
        if (!option.isNew) {
          option.rollbackAttributes();
          this.options.pushObject(option);
        }
      }

      this.router.transitionTo(
        'codelists-management.codelist',
        this.args.codelist.id
      );
    }
  }

  @action
  sortEndAction() {
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      option.position = i;
      option.save();
    }
  }
}
