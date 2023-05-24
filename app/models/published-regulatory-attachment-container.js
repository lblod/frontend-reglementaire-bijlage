import Model, { belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachmentContainer extends Model {
  @belongsTo('published-regulatory-attachment', { inverse: null, async: true })
  currentVersion;
  @belongsTo('document-container', { inverse: 'publishedVersion', async: true })
  derivedFrom;
}
