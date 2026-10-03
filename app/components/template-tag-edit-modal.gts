import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { isBlank } from 'frontend-reglementaire-bijlage/utils/strings';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { localCopy } from 'tracked-toolbox';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { or, and } from 'ember-truth-helpers';

type Args = {
  tag?: TemplateTag;
  isSaving: boolean;

  onSave?: (tag: TemplateTag) => void;
};

export default class TemplateTagEditModal extends Component<Args> {
  @service declare router: RouterService;
  @service declare store: Store;
  @localCopy('args.tag.value') tagLabel: string | null = null;

  @tracked titleExists = false;

  checkTitle = restartableTask(async (event: Event) => {
    this.titleExists = true;
    const newLabel = (event.target as HTMLInputElement).value;
    this.tagLabel = newLabel;
    if (!this.tagLabel || !this.labelChanged) {
      this.titleExists = false;
      return;
    }
    await timeout(300);
    const tags = await this.store.query('template-tag', {
      'filter[:exact:value]': newLabel,
    });

    this.titleExists = tags.length > 0;
  });

  get isInvalidTagTitle() {
    return this.titleExists || isBlank(this.tagLabel);
  }

  get saveIsDisabled() {
    return this.isInvalidTagTitle || !this.labelChanged;
  }

  get labelChanged() {
    return this.tagLabel !== this.args.tag?.value;
  }

  cancelEditTag = () => {
    this.router.transitionTo('tag-management');
  };

  saveTag = (event: Event) => {
    event.preventDefault();
    if (!this.tagLabel || this.isInvalidTagTitle) return;
    let { tag } = this.args;
    if (!tag) {
      this.args.onSave?.(
        this.store.createRecord<TemplateTag>('template-tag', {
          createdOn: new Date(),
          value: this.tagLabel,
        }),
      );
    } else {
      tag.value = this.tagLabel;
      this.args.onSave?.(tag);
    }
  };

  <template>
    <AuModal
      @title={{t
        (if @tag.value 'tag-management.edit.title' 'tag-management.new.title')
      }}
      @modalOpen={{true}}
      @closeModal={{this.cancelEditTag}}
      as |Modal|
    >
      <Modal.Body>
        <form
          class='au-c-form'
          id='create-template-tag-form'
          {{on 'submit' this.saveTag}}
        >
          <AuFormRow>
            <AuLabel @required={{true}} for='tag-name'>
              {{t 'utility.attr.name'}}
            </AuLabel>
            <AuInput
              value={{this.tagLabel}}
              @width='block'
              id='template-title'
              type='text'
              {{on 'input' this.checkTitle.perform}}
              required
              autocomplete='off'
            />
          </AuFormRow>
          <AuFormRow>
            {{#if (and this.checkTitle.isIdle this.titleExists)}}
              <AuAlert
                class='au-u-1-1 au-u-margin-bottom-none'
                @size='small'
                @skin='warning'
                @icon='alert-triangle'
              >
                {{t 'tag-management.crud.already-exists'}}
              </AuAlert>
            {{/if}}
          </AuFormRow>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup>
          <AuButton {{on 'click' this.cancelEditTag}} @skin='secondary'>
            {{t 'template-management.create-modal.cancel'}}
          </AuButton>
          <AuButton
            class='au-c-button'
            form='create-meeting-form'
            @disabled={{this.saveIsDisabled}}
            @loading={{or @isSaving this.checkTitle.isRunning}}
            @loadingMessage={{if
              this.checkTitle.isRunning
              (t 'utility.checking')
              undefined
            }}
            {{on 'click' this.saveTag}}
          >
            {{t 'template-management.create-modal.save'}}
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
