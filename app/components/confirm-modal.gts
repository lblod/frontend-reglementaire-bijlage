import Component from '@glimmer/component';
import { action } from '@ember/object';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { or } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';

type Sig = {
  Args: {
    confirmMessage?: string;
    isAlert?: boolean;
    modalOpen?: boolean;
    confirmDisabled?: boolean;
    closeModal: () => void;
    onConfirm: () => void;
    onCancel: () => void;
  };
  Blocks: {
    title: [];
    body: [];
  }
  Element: HTMLDivElement;
};

/**
 * A generic 'confirmation' modal to avoid copy-pasting boilerplate and to keep a consistent style.
 */
export default class ConfirmModalComponent extends Component<Sig> {
  @action
  onConfirm() {
    if (this.args.onConfirm) {
      this.args.onConfirm();
    }
    this.args.closeModal();
  }

  @action
  onCancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    this.args.closeModal();
  }
  <template>
    <AuModal
      @modalOpen={{@modalOpen}}
      @closeModal={{this.onCancel}}
      ...attributes
    >
      <:title>
        {{#if (has-block 'title')}}

          {{yield to='title'}}
        {{else}}
          {{t 'utility.confirmation.body'}}
        {{/if}}
      </:title>
      <:body>
        {{yield to='body'}}
      </:body>
      <:footer>
        <AuButtonGroup class="au-u-flex au-u-flex--end">
          <AuButton @skin='naked' {{on 'click' this.onCancel}}>
            {{t 'utility.cancel'}}
          </AuButton>
          <AuButton
            @skin='primary'
            @alert={{@isAlert}}
            {{on 'click' this.onConfirm}}
          >
            {{or @confirmMessage (t 'utility.confirm')}}
          </AuButton>
        </AuButtonGroup>
      </:footer>
    </AuModal>
  </template>
}
