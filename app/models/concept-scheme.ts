import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type SkosConcept from './skos-concept';
import type { Type } from '@warp-drive/core-types/symbols';

export default class ConceptScheme extends Model {
  declare [Type]: 'concept-scheme';

  @attr label?: string;
  @hasMany<SkosConcept>('skos-concept', {
    inverse: 'inScheme',
    async: true,
    polymorphic: true,
    as: 'concept-scheme',
  })
  declare concepts: AsyncHasMany<SkosConcept>;
}
