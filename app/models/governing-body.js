import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class GoverningBodyModel extends Model {
  @attr uri;
  @attr naam;
  @attr('date') bindingEinde;
  @attr('date') bindingStart;
  @belongsTo('administrative-unit', { inverse: 'governing-body' })
  adminstrativeUnit;
  @belongsTo('administrative-unit-classification-code', { inverse: null })
  classification;
  @belongsTo('governing-body', { inverse: 'hasTimeSpecializations' })
  isTimeSpecializationOf;
  @hasMany('governing-body', { inverse: 'isTimeSpecializationOf' })
  hasTimeSpecializations;

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
