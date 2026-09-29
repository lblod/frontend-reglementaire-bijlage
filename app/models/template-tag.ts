import { hasMany, type AsyncHasMany } from '@ember-data/model';
import ConceptModel from './concept';
import type { Type } from '@warp-drive/core-types/symbols';
import type Template from './template';

export default class TemplateTag extends ConceptModel {
  declare [Type]: 'template-tag';
  @hasMany('template', {
    inverse: 'tags',
    async: true,
    as: 'template',
    polymorphic: true,
  })
  declare template: AsyncHasMany<Template>;
}
