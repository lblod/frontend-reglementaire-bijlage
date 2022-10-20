import Model, { belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachment extends Model {
  @belongsTo('file') content;
}
