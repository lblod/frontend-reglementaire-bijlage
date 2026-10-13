import Model, { attr, belongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type ConceptScheme from './concept-scheme';

export default class SkosConcept extends Model {
  declare [Type]: 'skos-concept';
  @attr uri?: string;
  @attr label?: string;
  @attr value?: string;
  @attr('datetime') createdOn?: Date;
  @attr position?: number;
  @belongsTo('concept-scheme', {
    inverse: 'concepts',
    polymorphic: true,
    async: true,
  })
  inScheme?: ConceptScheme;
}
