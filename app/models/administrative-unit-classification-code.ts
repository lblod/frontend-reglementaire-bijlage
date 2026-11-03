import Model, { attr } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';

export default class AdministrativeUnitClassificationCode extends Model {
  declare [Type]: 'administrative-unit-classification-code';
  @attr label?: string;
  @attr scopeNote?: string;
  @attr uri?: string;

  rdfaBindings = {
    class: 'http://www.w3.org/2004/02/skos/core#Concept',
    label: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    scopeNote: 'http://www.w3.org/2004/02/skos/core#scopeNote',
  };
}
