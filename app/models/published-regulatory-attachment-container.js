import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachmentContainer extends Model {
  @attr validThrough;
  @belongsTo('published-regulatory-attachment') currentVersion;
}
