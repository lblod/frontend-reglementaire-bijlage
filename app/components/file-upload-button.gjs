import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

export default class FileUploadButton extends Component {
  hiddenFileInput;

  @action
  onClick() {
    this.hiddenFileInput.click();
  }

  setupFileInput = modifier((element) => {
    this.hiddenFileInput = element;
  });

  <template>
    <AuButton
      @icon={{@icon}}
      @loading={{@loading}}
      {{on 'click' this.onClick}}
      ...attributes
    >{{yield}}</AuButton>
    {{!template-lint-disable require-input-label}}
    <input
      type='file'
      {{this.setupFileInput}}
      {{on 'change' @onChange}}
      multiple={{@multiple}}
      accept={{@accept}}
      hidden={{true}}
      aria-hidden={{true}}
    />
  </template>
}
