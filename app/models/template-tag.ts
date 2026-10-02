import { hasMany, type AsyncHasMany } from '@ember-data/model';
import ConceptModel from './concept';
import type { Type } from '@warp-drive/core-types/symbols';
import type DocumentContainer from './document-container';

export default class TemplateTag extends ConceptModel {
  declare [Type]: 'template-tag';
  @hasMany('document-container', {
    inverse: 'tags',
    async: true,
  })
  declare documentContainers: AsyncHasMany<DocumentContainer>;
}
