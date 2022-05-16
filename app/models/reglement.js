import Model, { belongsTo } from '@ember-data/model';

export default class Reglement extends Model {
  @belongsTo('document-container') document;
}
