import { attr, belongsTo } from '@ember-data/model';
import FileModel from './file';
export default class TemplateVersion extends FileModel {
  @belongsTo('editor-document', { async: true, inverse: null })
  derivedFrom;
  @attr validThrough;
  @attr title;
}
