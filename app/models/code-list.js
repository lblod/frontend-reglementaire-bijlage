import { attr, belongsTo } from '@ember-data/model';
import ConceptSchemeModel from './concept-scheme';

export default class CodeListModel extends ConceptSchemeModel {
  @attr('datetime') createdOn;
  @belongsTo('administrative-unit', { inverse: null, async: true }) publisher;
}
