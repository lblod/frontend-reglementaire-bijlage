import Component from '@glimmer/component';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import CodelistOptionValidations from '../validations/codelist-option';

export default class CodelistOptionFormComponent extends Component {
  CodelistOptionValidations = CodelistOptionValidations;

  @dropTask
  *save(codelistOption, event) {
    event.preventDefault();

    yield codelistOption.validate();

    if (codelistOption.isValid) {
      yield codelistOption.execute();
      this.args.onSubmit();
    }
  }

  @action
  setCodelistOptionValue(codelistOption, attributeName, event) {
    codelistOption[attributeName] = event.target.value;
  }
}
