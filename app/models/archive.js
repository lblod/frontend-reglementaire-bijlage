import Model, { belongsTo } from '@ember-data/model';

export default class ArchiveModel extends Model {
  @belongsTo('file', { async: true, inverse: null }) file;
}
