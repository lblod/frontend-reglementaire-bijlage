import Model, { belongsTo } from '@ember-data/model';

export default class DataContainerModel extends Model {
  @belongsTo('task', { async: true, inverse: 'result' }) task;
}
