import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { localCopy } from 'tracked-toolbox';
import TagSelector from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';

type Args = {
  templateTags: Tag[];
  onSave: (templateTags?: Tag[]) => Promise<void>;
};

export default class PropertyEditModal extends Component<Args> {
  @service declare store: Store;
  @service declare tagManager: TagManager;

  @tracked isModalOpen = false;
  @localCopy('args.templateTags') newTemplateTags: Tag[] = [];

  openModal = () => {
    this.isModalOpen = true;
  };

  closeModal = () => {
    this.isModalOpen = false;
  };

  changeTemplateTags = (newTemplateTags: Tag[]) => {
    this.newTemplateTags = newTemplateTags;
  };

  onSave = async () => {
    await this.args.onSave?.(this.newTemplateTags ?? undefined);
    this.closeModal();
  };

  onCancel = () => {
    this.newTemplateTags = this.args.templateTags;
    this.closeModal();
  };

  <template>
    <AuButton @icon='tag' @skin='secondary' {{on 'click' this.openModal}}>
      {{t 'template-management.template-information'}}
    </AuButton>
    <AuModal @modalOpen={{this.isModalOpen}} @closeModal={{this.onCancel}}>
      <:title>
        {{t 'template-management.template-information'}}
      </:title>
      <:body>
        <form class='au-c-form'>
          {{#if this.tagManager.tags.value}}
            <AuFormRow>
              <AuLabel for='decision-type'>{{t
                  'template-management.tags.label'
                }}</AuLabel>
              <TagSelector
                @tags={{this.tagManager.tags.value}}
                @selectedTags={{this.newTemplateTags}}
                @onChange={{this.changeTemplateTags}}
                @allowTagCreation={{true}}
                @tagConstructor={{this.tagManager.createTag}}
              />
            </AuFormRow>
          {{/if}}
        </form>
      </:body>
      <:footer>
        <AuButton @skin='secondary' {{on 'click' this.onCancel}}>{{t
            'utility.cancel'
          }}</AuButton>
        <AuButton {{on 'click' this.onSave}}>{{t 'utility.save'}}</AuButton>
      </:footer>
    </AuModal>
  </template>
}
