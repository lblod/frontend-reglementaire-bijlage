import { attr, hasMany, belongsTo } from '@ember-data/model';
import ConceptSchemeModel from './concept-scheme';

export default class CodeListModel extends ConceptSchemeModel {
  @attr('datetime') createdOn;
  @hasMany('mapping', { inverse: 'codeList', async: true }) mappings;
  @belongsTo('administrative-unit', { inverse: null, async: true }) publisher;
}
