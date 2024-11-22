import Model, { belongsTo, hasMany } from '@ember-data/model';

export default class DocumentContainerModel extends Model {
  @belongsTo('editor-document', { inverse: null, async: true }) currentVersion;
  @belongsTo('editor-document-folder', { inverse: null, async: true }) folder;
  @belongsTo('administrative-unit', { inverse: null, async: true }) publisher;

  @hasMany('editor-document', { inverse: 'documentContainer', async: true })
  revisions;
  @hasMany('snippet-list', { inverse: null, async: true })
  linkedSnippetLists;

  get templateTypeId() {
    return this.folder.then((folder) => folder?.id);
  }
}
