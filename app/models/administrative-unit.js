import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class AdministrativeUnitModel extends Model {
  @attr name;
  @attr uri;
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  classification;
  @hasMany('governing-body', { inverse: 'administrativeUnit', async: true })
  governingBody;

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuurseenheid',
    werkingsgebied: 'http://data.vlaanderen.be/ns/besluit#werkingsgebied',
    bestuursorgaan: 'http://data.vlaanderen.be/ns/besluit#bestuurt',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
  };
}
