import Model, { attr, belongsTo } from '@ember-data/model';

export default class RegulatoryAttachmentPublicationTask extends Model {
  @belongsTo('document-container') documentContainer;
  @attr status;
}
