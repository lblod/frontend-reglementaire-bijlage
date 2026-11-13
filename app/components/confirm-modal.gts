import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { or } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';

type Sig = {
  Args: {
    title?: string;
    confirmMessage?: string;
    isAlert?: boolean;
    isLoading?: boolean;
    loadingMessage?: string;
    modalOpen?: boolean;
    confirmDisabled?: boolean;
    closeModal: () => void;
    onConfirm: () => void;
    onCancel: () => void;
  };
  Blocks: {
    title: [];
    body: [];
  };
  Element: HTMLDivElement;
};

/**
 * A generic 'confirmation' modal to avoid copy-pasting boilerplate and to keep a consistent style.
 */
export default class ConfirmModalComponent extends Component<Sig> {
  onConfirm = () => {
    this.args.onConfirm?.();
  };

  onCancel = () => {
    this.args?.onCancel();
  };
  <template>
    <AuModal
      @modalOpen={{@modalOpen}}
      @closeModal={{this.onCancel}}
      ...attributes
    >
      <:title>
        {{#if (has-block 'title')}}
          {{yield to='title'}}
        {{else if @title}}
          {{@title}}
        {{else}}
          {{t 'utility.confirmation.body'}}
        {{/if}}
      </:title>
      <:body>
        {{yield to='body'}}
      </:body>
      <:footer>
        <AuButtonGroup class='au-u-flex au-u-flex--end'>
          <AuButton
            @disabled={{@isLoading}}
            @skin='naked'
            {{on 'click' this.onCancel}}
          >
            {{t 'utility.cancel'}}
          </AuButton>
          <AuButton
            @skin='primary'
            @alert={{@isAlert}}
            @loading={{@isLoading}}
            @loadingMessage={{or @loadingMessage (t 'utility.loading')}}
            {{on 'click' this.onConfirm}}
          >
            {{or @confirmMessage (t 'utility.confirm')}}
          </AuButton>
        </AuButtonGroup>
      </:footer>
    </AuModal>
  </template>
}
