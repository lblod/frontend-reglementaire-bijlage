import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class SnippetList extends Model {
  @attr uri;
  @attr label;
  @attr('datetime') createdOn;
  @attr importedResources;

  @hasMany('snippet', { async: true, inverse: 'snippetList' }) snippets;

  @belongsTo('administrative-unit', { async: true, inverse: null }) publisher;
}
