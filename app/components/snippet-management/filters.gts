import Component from '@glimmer/component';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import t from 'ember-intl/helpers/t';
import TemplateTagSelector from 'frontend-reglementaire-bijlage/components/tag-selector';
import { on } from '@ember/modifier';
import Tag from 'frontend-reglementaire-bijlage/models/tag';

type Args = {
  label?: string;
  onResetFilters?: () => void;
  onChangeLabel?: (title: string) => void;
  onChangeTags?: (tags: Tag[]) => void;
  selectedTags: Tag[];
};

export default class SnippetManagementFiltersComponent extends Component<Args> {
  changeTitle = (event: Event) => {
    const newTitle = (event.target as HTMLInputElement).value;
    this.args.onChangeLabel?.(newTitle);
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
            {{t 'snippets.filters.label'}}
          </AuLabel>
          <AuInput
            {{on 'input' this.changeTitle}}
            class='au-u-1-1'
            id='filter-template-title'
            value={{@label}}
          />
        </AuFormRow>
        <AuFormRow>
          <AuLabel for='filter-tags'>
            {{t 'template-management.filters.tags'}}
          </AuLabel>
          <div class='tag-selector-container'>
            <TemplateTagSelector
              @onChange={{@onChangeTags}}
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
