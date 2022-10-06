import Model, { attr } from '@ember-data/model';

export default class PublishedRegulatoryAttachmentContainer extends Model {
  @attr validThrough;
}
