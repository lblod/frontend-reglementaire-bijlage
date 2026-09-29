import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';
import PowerSelect from 'ember-power-select/components/power-select';
import TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

type Args = {
  onChange?: (tags: TemplateTag[]) => void;
  selectedTags?: TemplateTag[];
  allowCreate?: boolean;
};

type Signature = {
  Args: Args;
  Element: HTMLElement;
};

type NewTag = {
  label: string;
  // this works better than a boolean "isNew" for runtime type-checking
  optionType: 'new';
  searchTerm?: string;
};
type SelectorOption = TemplateTag | NewTag;

export default class TemplateTagSelectorComponent extends Component<Signature> {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked searchTerm: string | null = null;
  @tracked addedTags: TemplateTag[] = [];

  tags = trackedFunction<Promise<TemplateTag[]>>(this, async () => {
    const tags = (await this.store.countAndFetchAll('template-tag', {}))
      .content as TemplateTag[];
    return tags.slice();
  });

  changeSelection = (selectedTags: SelectorOption[]) => {
    // split up the selected options into existing and new tags
    // this is a bit verbose but it's the most type-safe way to do this
    const existingTags: TemplateTag[] = [];
    const newTags: NewTag[] = [];
    for (const tagOrNew of selectedTags) {
      if ('optionType' in tagOrNew) {
        newTags.push(tagOrNew);
      } else {
        existingTags.push(tagOrNew);
      }
    }
    this.searchTerm = null;
    // power-select doesn't allow you to make more than 1 new option at at time
    // but just in case
    if (newTags.length > 1) {
      throw new Error(
        'unexpected state, only one new tag should be created at a time',
      );
    }
    const addOption = newTags[0];
    let newSelectedTags;
    if (addOption) {
      const newOption = this.store.createRecord<TemplateTag>('template-tag', {
        label: addOption.searchTerm,
        createdOn: new Date(),
      });
      this.addedTags = [...this.addedTags, newOption];
      newSelectedTags = [...existingTags, newOption];
    } else {
      newSelectedTags = existingTags;
    }

    this.args.onChange?.(newSelectedTags);
  };

  get options() {
    const options: SelectorOption[] = [
      ...(this.tags.value ?? []),
      ...this.addedTags,
    ];
    if (
      this.args.allowCreate &&
      this.searchTerm &&
      !options.find((tag) => tag.label === this.searchTerm)
    ) {
      options.push({
        optionType: 'new',
        label: this.intl.t('tag-management.create-new-tag', {
          tagName: this.searchTerm,
        }),
        searchTerm: this.searchTerm,
      });
    }
    return options;
  }

  setSearchTerm = (term: string) => {
    this.searchTerm = term;
  };

  <template>
    <PowerSelect
      @onChange={{this.changeSelection}}
      @options={{this.options}}
      @multiple={{true}}
      @searchEnabled={{true}}
      @selected={{@selectedTags}}
      @searchField='label'
      @onInput={{this.setSearchTerm}}
      ...attributes
      as |tag|
    >
      {{tag.label}}
    </PowerSelect>
  </template>
}
