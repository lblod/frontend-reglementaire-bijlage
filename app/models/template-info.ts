import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type { Type } from '@warp-drive/core-types/symbols';
import { type Option } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import type DocumentContainerModel from './document-container';
import type Tag from './tag';

export default class TemplateInfoModel extends Model {
  declare [Type]: 'template-info';

  @attr uri: Option<string>;

  @hasMany<DocumentContainerModel>('document-container', {
    inverse: 'templateInfo',
    async: true,
  })
  declare documentContainers: AsyncHasMany<DocumentContainerModel>;

  @hasMany<Tag>('tag', {
    inverse: 'templateInfos',
    async: true,
  })
  declare tags: AsyncHasMany<DocumentContainerModel>;
}
