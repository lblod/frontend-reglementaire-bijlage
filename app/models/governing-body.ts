import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import type AdministrativeUnitModel from './administrative-unit';
import type AdministrativeUnitClassificationCode from './administrative-unit-classification-code';
import type { Type } from '@warp-drive/core-types/symbols';

export default class GoverningBodyModel extends Model {
  declare [Type]: 'governing-body';

  @attr uri?: string;
  @attr naam?: string;
  @attr('date') bindingEinde?: Date;
  @attr('date') bindingStart?: Date;

  @belongsTo<AdministrativeUnitModel>('administrative-unit', {
    inverse: 'governingBody',
    async: true,
  })
  declare adminstrativeUnit: AsyncBelongsTo<AdministrativeUnitModel>;
  @belongsTo<AdministrativeUnitClassificationCode>(
    'administrative-unit-classification-code',
    {
      inverse: null,
      async: true,
    },
  )
  declare classification: AsyncBelongsTo<AdministrativeUnitClassificationCode>;
  @belongsTo<GoverningBodyModel>('governing-body', {
    inverse: 'hasTimeSpecializations',
    async: true,
  })
  declare isTimeSpecializationOf: AsyncBelongsTo<GoverningBodyModel>;
  @hasMany<GoverningBodyModel>('governing-body', {
    inverse: 'isTimeSpecializationOf',
    async: true,
  })
  declare hasTimeSpecializations: AsyncHasMany<GoverningBodyModel>;

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuursorgaan',
    bindingStart: 'http://data.vlaanderen.be/ns/mandaat#bindingStart',
    bindingEinde: 'http://data.vlaanderen.be/ns/mandaat#bindingEinde',
    bestuurseenheid: 'http://data.vlaanderen.be/ns/besluit#bestuurt',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
    isTijdsspecialisatieVan:
      'http://data.vlaanderen.be/ns/mandaat#isTijdspecialisatieVan',
    bevat: 'http://www.w3.org/ns/org#hasPost',
  };
}
