import Model, { attr, belongsTo } from '@ember-data/model';

export default class SnippetListPublicationTask extends Model {
  @belongsTo('document-container', { async: true, inverse: null })
  documentContainer;
  @belongsTo('snippet-list', { async: true, inverse: null })
  snippetList;
  @attr status;
}
