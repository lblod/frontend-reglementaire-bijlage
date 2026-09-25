import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';
import PowerSelect from 'ember-power-select/components/power-select';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import { localCopy } from 'tracked-toolbox';
import { tracked } from '@glimmer/tracking';

type Args = {
  onChange?: (tags: TemplateTag[]) => void;
  selectedTags?: TemplateTag[];
  allowCreate?: boolean;
};

type Signature = {
  Args: Args;
  Element: HTMLElement;
};

type SelectorOption = {
  label: string;
  isAddOption?: boolean;
  searchTerm?: string;
};

export default class TemplateTagSelectorComponent extends Component<Signature> {
  @service declare store: Store;

  @localCopy('args.selectedTags') selectedTags: TemplateTag[] = [];

  @tracked searchTerm = null;
  @tracked addedTags = [];

  tags = trackedFunction(this, async () => {
    const tags = await this.store.countAndFetchAll('template-tag', {});
    return tags.slice();
  });

  changeSelection = (selectedTags: SelectorOption[]) => {
    const addOption = selectedTags.find((option) => option.isAddOption);
    this.searchTerm = null;
    if (addOption) {
      const newOption = this.store.createRecord('template-tag', {
        label: addOption.searchTerm,
        createdOn: new Date(),
      });
      this.addedTags = [...this.addedTags, newOption];
      this.selectedTags = [...selectedTags.slice(0, -1), newOption];
    } else {
      this.selectedTags = selectedTags;
    }

    this.args.onChange?.(this.selectedTags);
  };

  get options() {
    const options = [...this.tags.value, ...this.addedTags];
    if (
      this.args.allowCreate &&
      this.searchTerm &&
      !options.find((tag) => tag.label === this.searchTerm)
    ) {
      options.push({
        isAddOption: true,
        label: `Create new tag "${this.searchTerm}"`,
        searchTerm: this.searchTerm,
      });
    }
    return options;
  }

  setSearchTerm = (term) => {
    this.searchTerm = term;
  };

  <template>
    {{#if this.tags.value}}
      <PowerSelect
        @onChange={{this.changeSelection}}
        @options={{this.options}}
        @multiple={{true}}
        @searchEnabled={{true}}
        @selected={{this.selectedTags}}
        @searchField='label'
        @onInput={{this.setSearchTerm}}
        ...attributes
        as |tag|
      >
        {{tag.label}}
      </PowerSelect>
    {{/if}}
  </template>
}
