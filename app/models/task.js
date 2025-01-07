import Model, { attr } from '@ember-data/model';

export default class TaskModel extends Model {
  @attr uri;
  @attr status;
  @attr operation;
  @attr created;
  @attr modified;
}
