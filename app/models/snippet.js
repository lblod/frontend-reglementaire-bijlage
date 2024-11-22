import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SnippetModel extends Model {
  @attr('string') uri;
  @attr('number') position;
  @attr('datetime') createdOn;
  @attr('datetime') updatedOn;

  @belongsTo('snippet-version', { inverse: null, async: true }) currentVersion;
  @belongsTo('snippet-list', { inverse: 'snippets', async: true }) snippetList;

  @hasMany('snippet-version', { inverse: 'snippet', async: true }) revisions;
  @hasMany('snippet-list', { inverse: null, async: true }) linkedSnippetLists;
}
