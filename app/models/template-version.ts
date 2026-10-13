import { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import FileModel from './file';
import type { Type } from '@warp-drive/core-types/symbols';
import type EditorDocumentModel from './editor-document';
export default class TemplateVersion extends FileModel {
  declare [Type]: 'template-version';

  @attr validThrough?: string;
  @attr title?: string;

  @belongsTo<EditorDocumentModel>('editor-document', { async: true, inverse: null })
  declare derivedFrom: AsyncBelongsTo<EditorDocumentModel>;
}
