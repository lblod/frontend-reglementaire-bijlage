import { hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type DocumentContainer from './document-container';
import SkosConcept from './skos-concept';

export default class Tag extends SkosConcept {
  //@ts-expect-error TODO: we should make SkosConcept an abstract baseclass
  // and not use inheritance the way we're doing now
  declare [Type]: 'tag';
  @hasMany('document-container', {
    inverse: 'tags',
    async: true,
  })
  declare documentContainers: AsyncHasMany<DocumentContainer>;
  // @ts-expect-error wip
  label: Error;
}
