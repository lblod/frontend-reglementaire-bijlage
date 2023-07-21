import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublishedSnippet extends Model {
  @belongsTo('editor-document', {
    async: true,
    inverse: 'publishedSnippetVersion',
  })
  derivedFrom;
  @attr title;
  @attr content;
  @attr('datetime') createdOn;
  @attr('datetime') validThrough;
}
