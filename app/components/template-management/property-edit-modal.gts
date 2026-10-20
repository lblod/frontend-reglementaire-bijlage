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
import TagSelector, {
  type NewTag,
} from '@lblod/ember-rdfa-editor-lblod-plugins/components/common/tags/tag-selector';
import { trackedFunction } from 'reactiveweb/function';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import { service } from '@ember/service';

type Args = {
  templateTags: Tag[];
  onSave: (templateTags?: Tag[]) => Promise<void>;
};

export default class PropertyEditModal extends Component<Args> {
  @service declare store: Store;
  @tracked isModalOpen = false;
  @localCopy('args.templateTags') newTemplateTags: Tag[] = [];

  tags = trackedFunction<Promise<Tag[]>>(this, async () => {
    const tags = (
      await this.store.countAndFetchAll('tag', { sort: ':no-case:value' })
    ).content as Tag[];
    return tags.slice();
  });

  createTag = (newTag: NewTag) => {
    return this.store.createRecord<Tag>('tag', {
      value: newTag.searchTerm,
      createdOn: new Date(),
    });
  };

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
  }

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
          {{#if this.tags.value}}
            <AuFormRow>
              <AuLabel for='decision-type'>{{t
                  'template-management.tags.label'
                }}</AuLabel>
              <TagSelector
                @tags={{this.tags.value}}
                @selectedTags={{this.newTemplateTags}}
                @onChange={{this.changeTemplateTags}}
                @allowTagCreation={{true}}
                @tagConstructor={{this.createTag}}
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
