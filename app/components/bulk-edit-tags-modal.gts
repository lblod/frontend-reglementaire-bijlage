import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import TagSelector from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import { service } from '@ember/service';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';

type Args = {
  onSave: (changes: { add: Tag[]; remove: Tag[] }) => void;
  onClose: () => void;
};

export default class BulkEditTagsModal extends Component<Args> {
  @service declare tagManager: TagManager;

  @tracked tagsToRemove: Tag[] = [];
  @tracked tagsToAdd: Tag[] = [];

  saveChanges = () => {
    return this.args?.onSave({
      add: this.tagsToAdd,
      remove: this.tagsToRemove,
    });
  };

  setTagsToAdd = (tags: Tag[]) => {
    this.tagsToAdd = tags;
  };

  setTagsToRemove = (tags: Tag[]) => {
    this.tagsToRemove = tags;
  };

  get saveButtonDisabled() {
    return this.tagsToAdd.length + this.tagsToRemove.length === 0;
  }

  <template>
    <AuModal
      @title={{t 'template-management.create-modal.title'}}
      @modalOpen={{true}}
      @closeModal={{@onClose}}
      as |Modal|
    >
      <Modal.Body>
        <form
          class='au-c-form'
          id='bulk-tag-edit-form'
        >
          <AuFormRow>
            <AuLabel for='bulk-tags-to-add'>
              {{t 'tag-management.add-tags'}}
            </AuLabel>
            <TagSelector
              id='bulk-tags-to-add'
              class='au-u-1-1'
              @tags={{this.tagManager.tags}}
              @selectedTags={{this.tagsToAdd}}
              @onChange={{this.setTagsToAdd}}
              @allowTagCreation={{true}}
              @tagConstructor={{this.tagManager.createTag}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='bulk-tags-to-remove'>
              {{t 'tag-management.remove-tags'}}
            </AuLabel>
            <TagSelector
              id='bulk-tags-to-remove'
              class='au-u-1-1'
              @tags={{this.tagManager.tags}}
              @selectedTags={{this.tagsToRemove}}
              @onChange={{this.setTagsToRemove}}
            />
          </AuFormRow>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup>
          <AuButton
            class='au-c-button'
            @disabled={{this.saveButtonDisabled}}
            {{on 'click' this.saveChanges}}
          >
            {{t 'template-management.create-modal.save'}}
          </AuButton>
          <AuButton {{on 'click' @onClose}} @skin='secondary'>
            {{t 'template-management.create-modal.cancel'}}
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
