import Model, {
  belongsTo,
  hasMany,
  attr,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';
import type EditorDocumentModel from './editor-document';
import type EditorDocumentFolderModel from './editor-document-folder';
import type AdministrativeUnitModel from './administrative-unit';
import type SnippetList from './snippet-list';
import type Template from './template';
import type Tag from './tag';
import type { Type } from '@warp-drive/core-types/symbols';

export default class DocumentContainerModel extends Model {
  declare [Type]: 'document-container';

  @attr declare uri?: string;

  @belongsTo<EditorDocumentModel>('editor-document', {
    inverse: null,
    async: true,
  })
  declare currentVersion: AsyncBelongsTo<EditorDocumentModel>;
  @belongsTo<EditorDocumentFolderModel>('editor-document-folder', {
    inverse: null,
    async: true,
  })
  declare folder: AsyncBelongsTo<EditorDocumentFolderModel>;
  @belongsTo<AdministrativeUnitModel>('administrative-unit', {
    inverse: null,
    async: true,
  })
  declare publisher: AsyncBelongsTo<AdministrativeUnitModel>;

  @hasMany<EditorDocumentModel>('editor-document', {
    inverse: 'documentContainer',
    async: true,
  })
  declare revisions: AsyncHasMany<EditorDocumentModel>;
  @hasMany<SnippetList>('snippet-list', { inverse: null, async: true })
  declare linkedSnippetLists: AsyncHasMany<SnippetList>;
  @belongsTo<Template>('template', {
    inverse: 'derivedFrom',
    async: true,
    polymorphic: true,
    as: 'document-container',
  })
  declare template: AsyncBelongsTo<Template>;
  @hasMany<Tag>('tag', { inverse: 'documentContainers', async: true })
  declare tags: AsyncHasMany<Tag>;

  get templateTypeId() {
    return this.folder.then((folder) => folder?.id);
  }
}
