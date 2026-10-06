import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';
import PowerSelect from 'ember-power-select/components/power-select';
import Tag from 'frontend-reglementaire-bijlage/models/tag';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

type Args = {
  onChange?: (tags: Tag[]) => void;
  selectedTags?: Tag[];
  allowCreate?: boolean;
  tagList?: Tag[];
};

type Signature = {
  Args: Args;
  Element: HTMLElement;
};

type NewTag = {
  value: string;
  // this works better than a boolean "isNew" for runtime type-checking
  optionType: 'new';
  searchTerm?: string;
};
type SelectorOption = Tag | NewTag;

export default class TemplateTagSelectorComponent extends Component<Signature> {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked searchTerm: string | null = null;
  @tracked addedTags: Tag[] = [];

  tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    const tags = (await this.store.countAndFetchAll('tag', {}))
      .content as Tag[];
    return tags.slice();
  });
  get tagListIsExternal() {
    return Boolean(this.args.tagList);
  }

  changeSelection = (selectedTags: SelectorOption[]) => {
    // split up the selected options into existing and new tags
    // this is a bit verbose but it's the most type-safe way to do this
    const existingTags: Tag[] = [];
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
      const newOption = this.store.createRecord<Tag>('tag', {
        value: addOption.searchTerm,
        createdOn: new Date(),
      });
      if (!this.tagListIsExternal) {
        this.addedTags = [...this.addedTags, newOption];
      }
      newSelectedTags = [...existingTags, newOption];
    } else {
      newSelectedTags = existingTags;
    }

    this.args.onChange?.(newSelectedTags);
  };

  get options() {
    const options: SelectorOption[] = this.args.tagList?.slice() ?? [
      ...(this.tags.value?.slice() ?? []),
      ...this.addedTags,
    ];

    if (
      this.args.allowCreate &&
      this.searchTerm &&
      !options.find((tag) => tag.value === this.searchTerm)
    ) {
      options.push({
        optionType: 'new',
        value: this.intl.t('tag-management.create-new-tag', {
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
      @searchField='value'
      @onInput={{this.setSearchTerm}}
      class='template-tag-selector-powerselect'
      ...attributes
      as |tag|
    >
      <span class='template-tag-selector-item' title={{tag.value}}>
        {{tag.value}}
      </span>
    </PowerSelect>
  </template>
}
