import Model, { belongsTo, hasMany } from '@ember-data/model';

export default class DocumentContainerModel extends Model {
  @hasMany('editor-document', { inverse: 'documentContainer', async: true })
  revisions;
  @belongsTo('editor-document', { inverse: null, async: true }) currentVersion;
  @belongsTo('skos-concept', { inverse: null, async: true }) status;
  @belongsTo('editor-document-folder', { inverse: null, async: true }) folder;
  @belongsTo('administrative-unit', { inverse: null, async: true }) publisher;
  @belongsTo('published-regulatory-attachment-container', {
    inverse: 'derivedFrom',
    async: true,
  })
  publishedVersion;
  @belongsTo('published-snippet-container', {
    inverse: 'derivedFrom',
    async: true,
  })
  publishedSnippetVersion;
  @hasMany('snippet-list', { inverse: 'templates', async: true })
  snippetLists;
}
