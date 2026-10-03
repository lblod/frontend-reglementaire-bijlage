import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptModel extends Model {
  @attr uri;
  @attr label;

  @attr('datetime') createdOn;

  @hasMany('concept-scheme', { inverse: null, async: true }) conceptSchemes;
  @hasMany('concept-scheme', { inverse: null, async: true }) topConceptSchemes;
}
