import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
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

  @tracked newValue = '';
  @tracked toDelete = [];
  @tracked options;

  @tracked codelistTypes;
  @tracked selectedType;

  CodelistValidations = CodelistValidations;

  constructor() {
    super(...arguments);
    console.log(this.currentSession.group.id);
    this.options = this.args.codelist.concepts;
    this.fetchCodelistTypes.perform();
  }

  get isSaving() {
    return this.editCodelistTask.isRunning;
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

  @action
  updateNewValue(event) {
    this.newValue = event.target.value;
  }

  @action
  addNewValue(event) {
    event.preventDefault();
    if (this.newValue) {
      const codeListOption = this.store.createRecord('skosConcept');
      codeListOption.label = this.newValue;
      this.options.pushObject(codeListOption);
      this.newValue = '';
    }
  }

  @action
  removeOption(option) {
    this.options.removeObject(option);
    this.toDelete.pushObject(option);
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
}
