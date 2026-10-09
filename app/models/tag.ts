import { hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type DocumentContainer from './document-container';
import SkosConcept from './skos-concept';
import type SnippetList from './snippet-list';

export default class Tag extends SkosConcept {
  //@ts-expect-error TODO: we should make SkosConcept an abstract baseclass
  // and not use inheritance the way we're doing now
  declare [Type]: 'tag';
  @hasMany('document-container', {
    inverse: 'tags',
    async: true,
  })
  declare documentContainers: AsyncHasMany<DocumentContainer>;
  @hasMany('snippet-list', {
    inverse: 'tags',
    async: true,
  })
  declare snippetLists: AsyncHasMany<SnippetList>;

  // @ts-expect-error wip
  label: Error;
}
