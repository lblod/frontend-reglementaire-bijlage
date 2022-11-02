import Model, { belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachmentContainer extends Model {
  @belongsTo('published-regulatory-attachment') currentVersion;
  @belongsTo('document-container') derivedFrom;
}
