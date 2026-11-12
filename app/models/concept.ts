import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type ConceptScheme from './concept-scheme';

export default class ConceptModel extends Model {
  @attr uri?: string;
  @attr label?: string;

  @attr('datetime') createdOn?: Date;

  @hasMany<ConceptScheme>('concept-scheme', { inverse: null, async: true })
  declare conceptSchemes: AsyncHasMany<ConceptScheme>;
  @hasMany<ConceptScheme>('concept-scheme', { inverse: null, async: true })
  declare topConceptSchemes: AsyncHasMany<ConceptScheme>;
}
