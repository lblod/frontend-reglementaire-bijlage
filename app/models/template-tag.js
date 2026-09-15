import { hasMany } from '@ember-data/model';
import ConceptModel from './concept';

export default class TemplateTag extends ConceptModel {
  @hasMany('template', {
    inverse: 'tags',
    async: true,
    as: 'template',
    polymorphic: true,
  })
  template;
}
