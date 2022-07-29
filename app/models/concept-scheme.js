import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptScheme extends Model {
  @attr label;
  @hasMany('skos-concept', { inverse: 'inScheme' }) concepts;
}
