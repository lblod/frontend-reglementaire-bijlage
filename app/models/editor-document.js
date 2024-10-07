import Model, { attr, belongsTo } from '@ember-data/model';
import defaultContext from '../config/editor-document-default-context';
import { htmlSafe } from '@ember/template';

export default class EditorDocumentModel extends Model {
  @attr uri;
  @attr title;
  @attr content;
  @attr templateVersion;
  @attr('string', { defaultValue: defaultContext }) context;
  @attr('datetime') createdOn;
  @attr('datetime') updatedOn;

  @belongsTo('editor-document', { inverse: 'nextVersion', async: true })
  previousVersion;
  @belongsTo('editor-document', { inverse: 'previousVersion', async: true })
  nextVersion;
  @belongsTo('document-container', { inverse: 'revisions', async: true })
  documentContainer;

  get htmlSafeContent() {
    return htmlSafe(this.content);
  }
}
