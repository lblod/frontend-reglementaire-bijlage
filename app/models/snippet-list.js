import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
/** @import Snippet from './snippet'; */
/** @import { Collection } from '@ember-data/store/-private/record-arrays/identifier-array'; */

export default class SnippetList extends Model {
  @attr uri;
  @attr label;
  @attr('datetime') createdOn;
  @attr importedResources;

  /** @type {Promise<Collection<Snippet>>} */
  @hasMany('snippet', { async: true, inverse: 'snippetList' }) snippets;

  @belongsTo('administrative-unit', { async: true, inverse: null }) publisher;
}
