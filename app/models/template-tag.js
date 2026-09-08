import { belongsTo } from '@ember-data/model';
import ConceptModel from './concept';

export default class TemplateTag extends ConceptModel {
  @belongsTo('template', { inverse: 'tags', async: true }) template;
}
