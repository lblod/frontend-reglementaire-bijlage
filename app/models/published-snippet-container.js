import Model, { belongsTo } from '@ember-data/model';

export default class PublishedSnippetContainer extends Model {
  @belongsTo('published-snippet', { inverse: null, async: true })
  currentVersion;
  @belongsTo('document-container', {
    inverse: 'publishedSnippetVersion',
    async: true,
  })
  derivedFrom;
}
