import Component from '@glimmer/component';
import AuButton, {
  type AuButtonSignature,
} from '@appuniversum/ember-appuniversum/components/au-button';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
type Signature = {
  Element: AuButtonSignature['Element'];
  Blocks: {
    default: [];
  };
  Args: {
    icon?: AuButtonSignature['Args']['icon'];
    loading?: AuButtonSignature['Args']['loading'];
    loadingMessage?: AuButtonSignature['Args']['loadingMessage'];
    onChange: (event: Event) => void;
    multiple?: boolean;
    accept?: string;
  };
};

export default class FileUploadButton extends Component<Signature> {
  hiddenFileInput?: HTMLInputElement;

  @action
  onClick() {
    this.hiddenFileInput?.click();
  }

  setupFileInput = modifier((element: HTMLInputElement) => {
    this.hiddenFileInput = element;
  });

  <template>
    <AuButton
      @icon={{@icon}}
      @loading={{@loading}}
      @loadingMessage={{@loadingMessage}}
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
