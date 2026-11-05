import { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import FileModel from './file';
import type EditorDocumentModel from './editor-document';
export default class TemplateVersion extends FileModel {
  @belongsTo('editor-document', { async: true, inverse: null })
  declare derivedFrom?: AsyncBelongsTo<EditorDocumentModel>;
  @attr declare validThrough?: Date;
  @attr declare title?: string;
}
