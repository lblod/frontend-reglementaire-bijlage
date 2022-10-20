import Model, { attr, belongsTo } from '@ember-data/model';

export default class RegulatoryStatement extends Model {
  @belongsTo('document-container') document;
  @attr folder;
  @belongsTo('published-regulatory-attachment-container') publishedVersion;
}
