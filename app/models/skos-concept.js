import Model, { attr, belongsTo } from '@ember-data/model';

export default class SkosConcept extends Model {
  @attr uri;
  @attr label;
  @attr('datetime') createdOn;
  @belongsTo('concept-scheme', { inverse: 'concepts', polymorphic: true })
  inScheme;
}
