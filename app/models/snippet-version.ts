import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import Snippet from 'frontend-reglementaire-bijlage/models/snippet';

export default class SnippetVersionModel extends Model {
  declare [Type]: 'snippet-version';
  @attr uri?: string;
  @attr content?: string;
  @attr('string', { defaultValue: 'Geen Titel' }) declare title: string;
  @attr('datetime') createdOn?: Date;
  @attr('datetime') validThrough?: Date;

  @belongsTo<Snippet>('snippet', { inverse: 'revisions', async: true })
  declare snippet: AsyncBelongsTo<Snippet>;
}
