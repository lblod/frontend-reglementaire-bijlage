import Model, { attr, belongsTo } from '@ember-data/model';
/** @import Snippet from './snippet'; */

export default class SnippetVersionModel extends Model {
  /** @type {string} */
  @attr('string') uri;
  /** @type {string} */
  @attr('string') title;
  /** @type {string} */
  @attr('string') content;
  /** @type {Date} */
  @attr('datetime') createdOn;
  /** @type {Date} */
  @attr('datetime') validThrough;

  /** @type {Promise<Collection<Snippet>>} */
  @belongsTo('snippet', { inverse: 'revisions', async: true }) snippet;
}
