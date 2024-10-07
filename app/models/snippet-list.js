import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class SnippetList extends Model {
  @attr label;
  @attr('datetime') createdOn;
  @attr importedResources;

  @hasMany('snippet', { async: true, inverse: 'snippetList' }) snippets;
  @hasMany('document-container', {
    async: true,
    inverse: 'snippetLists',
  })
  templates;
  @belongsTo('administrative-unit', { async: true, inverse: null }) publisher;
}
