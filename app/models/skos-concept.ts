import Model, { attr, belongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type ConceptScheme from './concept-scheme';

export default class SkosConcept extends Model {
  declare [Type]: 'skos-concept';
  @attr declare uri: string;
  @attr declare label?: string;
  @attr declare value?: string;
  @attr('datetime') declare createdOn?: Date;
  @attr declare position?: number;
  @belongsTo('concept-scheme', {
    inverse: 'concepts',
    polymorphic: true,
    async: true,
  })
  declare inScheme?: ConceptScheme;
}
