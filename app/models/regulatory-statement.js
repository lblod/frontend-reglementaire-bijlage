import Model, { belongsTo } from '@ember-data/model';

export default class RegulatoryStatement extends Model {
  @belongsTo('document-container') document;
}
