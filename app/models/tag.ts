import { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import SkosConcept from './skos-concept';
import type SnippetList from './snippet-list';
import type CodeListModel from './code-list';
import type TemplateInfoModel from './template-info';

export default class Tag extends SkosConcept {
  //@ts-expect-error TODO: we should make SkosConcept an abstract baseclass
  // and not use inheritance the way we're doing now
  declare [Type]: 'tag';

  @attr declare value: string;
  
  @hasMany<SnippetList>('snippet-list', {
    inverse: 'tags',
    async: true,
  })
  declare snippetLists: AsyncHasMany<SnippetList>;

  @hasMany<CodeListModel>('code-list', {
    inverse: 'tags',
    async: true,
  })
  declare codeLists: AsyncHasMany<CodeListModel>;

  @hasMany<TemplateInfoModel>('template-info', {
    inverse: 'tags',
    async:true,
  })
  declare templateInfos: AsyncHasMany<TemplateInfoModel>;

  // @ts-expect-error wip
  label: Error;
}
