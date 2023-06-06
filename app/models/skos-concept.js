import Model, { attr, belongsTo } from '@ember-data/model';

export default class SkosConcept extends Model {
  @attr uri;
  @attr label;
  @attr value;
  @attr('datetime') createdOn;
  @attr position;
  @belongsTo('concept-scheme', {
    inverse: 'concepts',
    polymorphic: true,
    async: true,
  })
  inScheme;
}
