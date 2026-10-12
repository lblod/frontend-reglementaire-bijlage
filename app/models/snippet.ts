import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import type SnippetVersionModel from './snippet-version';
import type SnippetList from './snippet-list';
import type { Type } from '@warp-drive/core-types/symbols';

export default class SnippetModel extends Model {
  declare [Type]: 'snippet';
  @attr declare uri?: string;
  @attr('number') declare position?: number;
  @attr('datetime') declare createdOn?: Date;
  @attr('datetime') declare updatedOn?: Date;

  @belongsTo<SnippetVersionModel>('snippet-version', {
    inverse: null,
    async: true,
  })
  declare currentVersion: AsyncBelongsTo<SnippetVersionModel>;

  @belongsTo<SnippetList>('snippet-list', { inverse: 'snippets', async: true })
  declare snippetList: AsyncBelongsTo<SnippetVersionModel>;

  @hasMany<SnippetVersionModel>('snippet-version', {
    inverse: 'snippet',
    async: true,
  })
  declare revisions: AsyncHasMany<SnippetVersionModel>;

  @hasMany<SnippetList>('snippet-list', { inverse: null, async: true })
  declare linkedSnippetLists: AsyncHasMany<SnippetList>;
}
