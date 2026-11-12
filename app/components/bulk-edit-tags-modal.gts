import AuModal from "@appuniversum/ember-appuniversum/components/au-modal"
import AuFormRow from "@appuniversum/ember-appuniversum/components/au-form-row"
import AuLabel from "@appuniversum/ember-appuniversum/components/au-label"
import AuButtonGroup from "@appuniversum/ember-appuniversum/components/au-button-group"
import AuButton from "@appuniversum/ember-appuniversum/components/au-button"
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import TagSelector from "@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector"
import { service } from "@ember/service"
import type TagManager from "frontend-reglementaire-bijlage/services/tag-manager"
import Component from "@glimmer/component"

export default class BulkEditTagsModal extends Component {
  @service declare tagManager: TagManager;

  <template>
    <AuModal
      @title={{t 'template-management.create-modal.title'}}
      @modalOpen={{true}}
      @closeModal={{this.cancelCreateTemplate}}
      as |Modal|
    >
      <Modal.Body>
        <form
          class='au-c-form'
          id='bulk-tag-edit-form'
        >
          <AuFormRow>
            <AuLabel for='template-type'>
              {{t 'template-management.tags.label'}}
            </AuLabel>
            <TagSelector
              @tags={{this.tagManager.tags}}
              @selectedTags={{this.tagsToCreate}}
              @onChange={{this.updateTemplateTags}}
              @allowTagCreation={{true}}
              @tagConstructor={{this.tagManager.createTag}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='template-type'>
              {{t 'template-management.tags.label'}}
            </AuLabel>
            <TagSelector
              @tags={{this.tagManager.tags}}
              @selectedTags={{this.tagsToCreate}}
              @onChange={{this.updateTemplateTags}}
              @allowTagCreation={{true}}
              @tagConstructor={{this.tagManager.createTag}}
            />
          </AuFormRow>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <AuButtonGroup>
          <AuButton
            class='au-c-button'
            form='create-meeting-form'
            type='submit'
            @disabled={{this.isInvalidTemplateTitle}}
          >
            {{t 'template-management.create-modal.save'}}
          </AuButton>
          <AuButton {{on 'click' this.cancelCreateTemplate}} @skin='secondary'>
            {{t 'template-management.create-modal.cancel'}}
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
