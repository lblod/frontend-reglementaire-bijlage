import Model, { attr, belongsTo, hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import type GoverningBodyModel from './governing-body';
import type AdministrativeUnitClassificationCode from './administrative-unit-classification-code';

export default class AdministrativeUnitModel extends Model {
  declare [Type]: 'administrative-unit';

  @attr name?: string;
  @attr uri?: string;

  @belongsTo<AdministrativeUnitClassificationCode>('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  declare classification: AsyncHasMany<AdministrativeUnitClassificationCode>;
  @hasMany<GoverningBodyModel>('governing-body', { inverse: 'administrativeUnit', async: true })
  declare governingBody: AsyncHasMany<GoverningBodyModel>;

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuurseenheid',
    werkingsgebied: 'http://data.vlaanderen.be/ns/besluit#werkingsgebied',
    bestuursorgaan: 'http://data.vlaanderen.be/ns/besluit#bestuurt',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
  };
}
