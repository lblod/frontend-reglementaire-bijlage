import Component from '@glimmer/component';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuCheckboxGroup from '@appuniversum/ember-appuniversum/components/au-checkbox-group';
import t from 'ember-intl/helpers/t';
import TemplateTagSelector from 'frontend-reglementaire-bijlage/components/template-tag-selector';
import {
  getTemplateType,
  type TemplateType,
} from 'frontend-reglementaire-bijlage/utils/template-type';
import { on } from '@ember/modifier';
import {
  DECISION_STANDARD_FOLDER,
  RS_STANDARD_FOLDER,
} from 'frontend-reglementaire-bijlage/utils/constants';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import Tag from 'frontend-reglementaire-bijlage/models/tag';
import type Store from 'frontend-reglementaire-bijlage/services/store';

type Args = {
  templateTitle?: string;
  onResetFilters?: () => void;
  onChangeTemplateTypes?: (templateType: TemplateType[]) => void;
  onChangeTemplateTitle?: (title: string) => void;
  onChangeTemplateTags?: (tags: Tag[]) => void;
  selectedTemplateTypes: TemplateType[];
  selectedTags: Tag[];
};

export default class TemplateManagementFilters extends Component<Args> {
  @service declare intl: IntlService;
  @service declare store: Store;

  changeTitle = (event: Event) => {
    const newTitle = (event.target as HTMLInputElement).value;
    this.args.onChangeTemplateTitle?.(newTitle);
  };
  get selectedTemplateTypes() {
    return this.args.selectedTemplateTypes.map((t) => t.folder);
  }

  changeTypes = (folders: string[]) => {
    const templateTypes = folders.flatMap(
      (folder) => getTemplateType(folder, this.intl) ?? [],
    );

    this.args.onChangeTemplateTypes?.(templateTypes);
  };

  resetFilters = () => {
    this.args.onResetFilters?.();
  };

  submit = (event: Event) => {
    event.preventDefault();
  };

  <template>
    <div class='au-o-box'>
      <AuHeading class='au-u-padding-bottom-small' @level='4' @skin='4'>{{t
          'template-management.filters.label'
        }}</AuHeading>
      <form
        class='au-c-form au-u-flex au-u-flex--column'
        {{on 'submit' this.submit}}
      >
        <AuFormRow>
          <AuLabel for='filter-template-title'>
            {{t 'reglementaire-bijlage-titel.description'}}
          </AuLabel>
          <AuInput
            {{on 'input' this.changeTitle}}
            class='au-u-1-1'
            id='filter-template-title'
            value={{@templateTitle}}
          />
        </AuFormRow>
        <AuFormRow>
          <AuLabel for='filter-template-type'>
            {{t 'template-management.template-type.label'}}
          </AuLabel>
          <AuCheckboxGroup
            @onChange={{this.changeTypes}}
            @selected={{this.selectedTemplateTypes}}
            id='filter-template-type'
            as |Group|
          >
            <Group.Checkbox @value={{DECISION_STANDARD_FOLDER}}>{{t
                'template-management.template-type.decision'
              }}</Group.Checkbox>
            <Group.Checkbox @value={{RS_STANDARD_FOLDER}}>{{t
                'template-management.template-type.regulatory-attachment'
              }}</Group.Checkbox>
          </AuCheckboxGroup>
        </AuFormRow>
        <AuFormRow>
          <AuLabel for='filter-tags'>
            {{t 'template-management.filters.tags'}}
          </AuLabel>
          <div class='tag-selector-container'>
            <TemplateTagSelector
              @onChange={{@onChangeTemplateTags}}
              @selectedTags={{@selectedTags}}
              id='filter-tags'
            />
          </div>

        </AuFormRow>
        <AuButton
          {{on 'click' this.resetFilters}}
          @icon='cross'
          @skin='naked'
          class='au-u-flex-self-end'
        >{{t 'template-management.filters.reset-all'}}</AuButton>
      </form>
    </div>
  </template>
}
