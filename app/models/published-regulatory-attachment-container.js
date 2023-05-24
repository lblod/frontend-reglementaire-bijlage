import Model, { belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachmentContainer extends Model {
  @belongsTo('published-regulatory-attachment', { async: true }) currentVersion;
  @belongsTo('document-container', { async: true }) derivedFrom;
}
