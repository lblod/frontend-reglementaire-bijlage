import { belongsTo } from '@ember-data/model';
import DataContainerModel from './data-container';

export default class ArchiveModel extends DataContainerModel {
  @belongsTo('file', { async: true, inverse: null }) file;
}
