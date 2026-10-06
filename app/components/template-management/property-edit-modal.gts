import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import TemplateTagSelector from 'frontend-reglementaire-bijlage/components/template-tag-selector';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import { localCopy } from 'tracked-toolbox';

type Args = {
  templateTags: Tag[];
  onSave: (templateTags?: Tag[]) => Promise<void>;
};

export default class PropertyEditModal extends Component<Args> {
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

  <template>
    <AuButton @icon='tag' @skin='secondary' {{on 'click' this.openModal}}>
      {{t 'template-management.template-information'}}
    </AuButton>
    <AuModal @modalOpen={{this.isModalOpen}} @closeModal={{this.closeModal}}>
      <:title>
        {{t 'template-management.template-information'}}
      </:title>
      <:body>
        <form class='au-c-form'>
          <AuFormRow>
            <AuLabel for='decision-type'>{{t
                'template-management.tags.label'
              }}</AuLabel>
            <TemplateTagSelector
              @allowCreate={{true}}
              @selectedTags={{this.newTemplateTags}}
              @onChange={{this.changeTemplateTags}}
            />
          </AuFormRow>
        </form>
      </:body>
      <:footer>
        <AuButton @skin='secondary' {{on 'click' this.closeModal}}>{{t
            'utility.cancel'
          }}</AuButton>
        <AuButton {{on 'click' this.onSave}}>{{t 'utility.save'}}</AuButton>
      </:footer>
    </AuModal>
  </template>
}
