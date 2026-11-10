import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { localCopy } from 'tracked-toolbox';
import TagSelector from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import DocumentInformationModal from '@lblod/ember-rdfa-editor-lblod-plugins/components/document-information-plugin/document-information-modal';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';
import type TagManager from 'frontend-reglementaire-bijlage/services/tag-manager';
import { SayController } from '@lblod/ember-rdfa-editor';
import type { BesluitTypePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-type-plugin';
import type { BesluitTargetGroupPluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-target-group-plugin/types';

type TemplateType = 'decision' | 'regulatory-attachment';

type Args = {
  controller: SayController;
  templateType: TemplateType;
  templateTags: Tag[];
  besluitTypeOptions: BesluitTypePluginOptions;
  besluitTargetGroupOptions: BesluitTargetGroupPluginOptions;
  onSave: (templateTags: Tag[]) => Promise<void>;
};

export default class TemplateInformationModal extends Component<Args> {
  @service declare store: Store;
  @service declare tagManager: TagManager;

  @tracked isModalOpen = false;
  @localCopy('args.templateTags') newTemplateTags: Tag[] = [];

  get isDecisionTemplate() {
    return this.args.templateType === 'decision';
  }

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
    await this.args.onSave(this.newTemplateTags);
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
    {{#if this.isModalOpen}}
      <DocumentInformationModal
        @title={{t 'template-management.template-information'}}
        @controller={{@controller}}
        @besluitTypeOptions={{@besluitTypeOptions}}
        @besluitTargetGroupOptions={{@besluitTargetGroupOptions}}
        @onSave={{this.onSave}}
        @onCancel={{this.onCancel}}
        {{! we never require a decision type for a template }}
        @requireBesluitType={{false}}
        as |DIM|
      >
        <div>
          <AuLabel for='decision-type'>{{t
              'template-management.tags.label'
            }}</AuLabel>
          <TagSelector
            @tags={{this.tagManager.tags}}
            @selectedTags={{this.newTemplateTags}}
            @onChange={{this.changeTemplateTags}}
            @allowTagCreation={{true}}
            @tagConstructor={{this.tagManager.createTag}}
          />
        </div>
        {{#if this.isDecisionTemplate}}
          <DIM.BesluitType />
          <DIM.BesluitTargetGroup />
        {{/if}}
      </DocumentInformationModal>
    {{/if}}
  </template>
}
