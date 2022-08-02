import Model, { attr, belongsTo } from '@ember-data/model';

export default class MappingModel extends Model {
  @attr('string') variable;
  @attr('string') type;
  @attr uri;
  @belongsTo('code-list', { inverse: 'mappings' }) codeList;
  @belongsTo('shape', { polyMorphic: true }) expects;
}
