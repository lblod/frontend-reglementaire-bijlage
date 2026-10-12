import Model, {
  attr,
  hasMany,
  belongsTo,
  type AsyncHasMany,
  type AsyncBelongsTo,
} from '@ember-data/model';
import Snippet from 'frontend-reglementaire-bijlage/models/snippet';
import type Tag from 'frontend-reglementaire-bijlage/models/tag';
import type AdministrativeUnitModel from './administrative-unit';
import { Type } from '@warp-drive/core-types/symbols';

export default class SnippetList extends Model {
  declare [Type]: 'snippet-list';
  @attr declare uri?: string;
  @attr declare label?: string;
  @attr('datetime') declare createdOn?: Date;
  @attr declare importedResources?: string;

  @hasMany<Snippet>('snippet', { async: true, inverse: 'snippetList' })
  declare snippets: AsyncHasMany<Snippet>;
  @hasMany('tag', { async: true, inverse: 'snippetLists' })
  declare tags: AsyncHasMany<Tag>;

  @belongsTo('administrative-unit', { async: true, inverse: null })
  declare publisher: AsyncBelongsTo<AdministrativeUnitModel>;
}
