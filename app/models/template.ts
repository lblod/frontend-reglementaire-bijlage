import Model, {
  hasMany,
  belongsTo,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import type TemplateVersion from './template-version';
import type DocumentContainerModel from './document-container';
import type AdministrativeUnitModel from './administrative-unit';

export default class Template extends Model {
  @belongsTo('template-version', { inverse: null, async: true })
  declare currentVersion?: AsyncBelongsTo<TemplateVersion>;
  @belongsTo('document-container', {
    inverse: 'template',
    async: true,
    as: 'template',
  })
  declare derivedFrom?: AsyncBelongsTo<DocumentContainerModel>;
  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare publisher?: AsyncBelongsTo<AdministrativeUnitModel>;
  @hasMany('template-version', { inverse: null, async: true })
  declare versions?: AsyncHasMany<TemplateVersion>;
}
