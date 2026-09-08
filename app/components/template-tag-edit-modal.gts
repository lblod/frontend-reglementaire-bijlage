import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { isBlank } from 'frontend-reglementaire-bijlage/utils/strings';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { localCopy } from 'tracked-toolbox';
import type Template from 'frontend-reglementaire-bijlage/models/template';

type Args = {
  tag?: TemplateTag;
  isSaving: boolean;

  onSave?: (tag: TemplateTag) => void;
};

export default class TemplateTagEditModal extends Component<Args> {
  @service declare router: RouterService;
  @service declare store: Store;
  @localCopy('args.tag.label') tagLabel;

  get isInvalidTagTitle() {
    return isBlank(this.tagLabel);
  }

  cancelEditTag = () => {
    this.router.transitionTo('tag-management');
  };

  updateTagName = (event: InputEvent) => {
    const newName = (event.target as HTMLInputElement).value;
    this.tagLabel = newName;
  };

  saveTag = (event: Event) => {
    event.preventDefault();

    let { tag } = this.args;
    if (!tag) {
      tag = this.store.createRecord('template-tag', {
        createdOn: new Date(),
        label: this.tagLabel,
      }) as TemplateTag;
    } else {
      tag.label = this.tagLabel;
    }

    this.args.onSave?.(tag);
  };

  <template>
    <AuModal
      @title={{t
        (if
          this.tagLabel 'tag-management.edit.title' 'tag-management.new.title'
        )
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
              {{on 'input' this.updateTagName}}
            />
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
            @disabled={{this.isInvalidTagTitle}}
            @loading={{@isSaving}}
            {{on 'click' this.saveTag}}
          >
            {{t 'template-management.create-modal.save'}}
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
