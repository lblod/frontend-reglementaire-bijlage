import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublishedRegulatoryAttachment extends Model {
  @belongsTo('editor-document') derivedFrom;
  @attr name;
  @attr format;
  @attr size;
  @attr extension;
  @attr('datetime') created;
  get downloadLink() {
    return `/files/${this.id}/download?name=${this.name}`;
  }
}
