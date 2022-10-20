import Model, { attr, belongsTo } from '@ember-data/model';

export default class RegulatoryAttachmentPublicationTask extends Model {
  @belongsTo('regulatory-statement') regulatoryAttachment;
  @attr status;
}
