import Component from '@glimmer/component';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import TemplateTypeSelector from 'frontend-reglementaire-bijlage/components/template-management/template-type-selector';
import { type TemplateType } from 'frontend-reglementaire-bijlage/utils/template-type';
import TemplateTagSelector from 'frontend-reglementaire-bijlage/components/template-tag-selector';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';

type Args = {
  templateType: TemplateType;
  templateTags: TemplateTag[];
  onChange: (args: {
    templateType?: TemplateType;
    templateTags?: TemplateTag[];
  }) => void;
};

export default class PropertyEditModal extends Component<Args> {
  @tracked isModalOpen = false;

  openModal = () => {
    this.isModalOpen = true;
  };

  closeModal = () => {
    this.isModalOpen = false;
  };

  changeTemplateType = (newTemplateType: TemplateType) => {
    this.args.onChange?.({
      templateType: newTemplateType,
      templateTags: this.args.templateTags,
    });
  };

  changeTemplateTags = (newTemplateTags: TemplateTag[]) => {
    this.args.onChange?.({
      templateType: this.args.templateType,
      templateTags: newTemplateTags,
    });
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
                'template-management.template-type.label'
              }}</AuLabel>
            <TemplateTypeSelector
              @onChange={{this.changeTemplateType}}
              @selected={{@templateType}}
            />
          </AuFormRow>
          <AuFormRow>
            <AuLabel for='decision-type'>{{t
                'template-management.tags.label'
              }}</AuLabel>
            <TemplateTagSelector
              @allowCreate={{true}}
              @selectedTags={{@templateTags}}
              @onChange={{this.changeTemplateTags}}
            />
          </AuFormRow>
        </form>
      </:body>
      <:footer>
        <AuButton @skin='secondary' {{on 'click' this.closeModal}}>{{t
            'utility.cancel'
          }}</AuButton>
        <AuButton>{{t 'utility.save'}}</AuButton>
      </:footer>
    </AuModal>
  </template>
}
