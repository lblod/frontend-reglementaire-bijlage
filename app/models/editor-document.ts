import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import defaultContext from '../config/editor-document-default-context';
import { htmlSafe } from '@ember/template';
import type DocumentContainerModel from './document-container';
import type { Type } from '@warp-drive/core-types/symbols';

export default class EditorDocumentModel extends Model {
  declare [Type]: 'editor-document';
  @attr uri?: string;
  @attr('string', { defaultValue: 'Geen titel' }) declare title: string;
  @attr content?: string;
  @attr templateVersion?: string;
  @attr('string', { defaultValue: defaultContext }) context?: string;
  @attr('datetime') createdOn?: Date;
  @attr('datetime') updatedOn?: Date;

  @belongsTo<DocumentContainerModel>('document-container', {
    inverse: 'revisions',
    async: true,
  })
  declare documentContainer: AsyncBelongsTo<DocumentContainerModel>;

  get htmlSafeContent() {
    return htmlSafe(this.content ?? '');
  }
}
