import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class SkosConcept extends Model {
  @attr label;
  @attr('datetime') createdOn;
  @hasMany('document-container', { async: true, inverse: null }) snippets;
  @belongsTo('administrative-unit', { async: true, inverse: null }) publisher;
}
