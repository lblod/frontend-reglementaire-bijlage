import { hasMany, belongsTo } from '@ember-data/model';
import ConceptSchemeModel from './concept-scheme';

export default class CodeListModel extends ConceptSchemeModel {
  @hasMany('mapping', { inverse: 'codeList' }) mappings;
  @belongsTo('skos-concept', { inverse: null }) type;
}
