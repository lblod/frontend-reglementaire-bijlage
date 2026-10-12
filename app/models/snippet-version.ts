import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import Snippet from 'frontend-reglementaire-bijlage/models/snippet';

export default class SnippetVersionModel extends Model {
  declare [Type]: 'snippet-version';
  @attr('string') declare uri?: string;
  @attr('string') declare title?: string;
  @attr('string') declare content?: string;
  @attr('datetime') declare createdOn?: Date;
  @attr('datetime') declare validThrough?: Date;

  @belongsTo<Snippet>('snippet', { inverse: 'revisions', async: true })
  declare snippet: AsyncBelongsTo<Snippet>;
}
