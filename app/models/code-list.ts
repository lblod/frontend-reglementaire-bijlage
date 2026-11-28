import {
  attr,
  belongsTo,
  hasMany,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import ConceptSchemeModel from './concept-scheme';
import type AdministrativeUnitModel from './administrative-unit';
import type Tag from './tag';
import type { Type } from '@warp-drive/core-types/symbols';

export default class CodeListModel extends ConceptSchemeModel {
  //@ts-expect-error TS doesn't allow subclasses to redefine concrete types. We should try to remove the inheritance chain.
  declare [Type]: 'code-list';

  @attr uri?: string;

  @attr('datetime') createdOn?: Date;
  @belongsTo<AdministrativeUnitModel>('administrative-unit', {
    inverse: null,
    async: true,
  })
  declare publisher: AsyncBelongsTo<AdministrativeUnitModel>;

  @hasMany<Tag>('tag', { inverse: 'codeLists', async: true })
  declare tags: AsyncHasMany<Tag>;
}
