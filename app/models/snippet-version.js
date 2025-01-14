import Model, { attr, belongsTo } from '@ember-data/model';

export default class SnippetVersionModel extends Model {
  @attr('string') uri;
  @attr('string') title;
  @attr('string') content;
  @attr('datetime') createdOn;
  @attr('datetime') validThrough;

  @belongsTo('snippet', { inverse: 'revisions', async: true }) snippet;
}
